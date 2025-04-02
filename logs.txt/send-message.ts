// supabase/functions/handle-message/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Expo } from 'https://esm.sh/expo-server-sdk@3.7.0'

const expo = new Expo();

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { record } = await req.json()
    const { barter_request_id, sender_id, content } = record

    // Get barter request details and user push tokens
    const { data: barter } = await supabaseAdmin
      .from('barter_requests')
      .select(`
        requester_id,
        owner_id,
        requested_product:requested_product_id(name),
        profiles!requester_id(push_token, username),
        owner:owner_id(push_token, username)
      `)
      .eq('id', barter_request_id)
      .single()

    if (!barter) {
      return new Response(
        JSON.stringify({ error: 'Barter not found' }),
        { status: 404 }
      )
    }

    // Determine recipient
    const isRequester = sender_id === barter.requester_id
    const recipientId = isRequester ? barter.owner_id : barter.requester_id
    const recipientToken = isRequester ? 
      barter.owner.push_token : 
      barter.profiles.push_token
    const senderName = isRequester ? 
      barter.profiles.username : 
      barter.owner.username

    // Prepare notification
    if (recipientToken) {
      const notification = {
        to: recipientToken,
        sound: 'default',
        title: `New message about ${barter.requested_product.name}`,
        body: `${senderName}: ${content}`,
        data: {
          type: 'BARTER_MESSAGE',
          barterId: barter_request_id,
          senderId: sender_id
        }
      }

      // Send notification
      const chunks = expo.chunkPushNotifications([notification])
      for (let chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk)
        } catch (error) {
          console.error('Error sending notification:', error)
        }
      }
    }

    // Store notification in database
    await supabaseAdmin
      .from('notifications')
      .insert([{
        user_id: recipientId,
        type: 'barter_message',
        data: {
          barter_id: barter_request_id,
          message: content,
          sender_name: senderName
        },
        read: false
      }])

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})