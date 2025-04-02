

[ App Start ]
      ↓
[ Check AsyncStorage.hasSeenOnboarding ]
      ↓
 ┌─────────────┐
 │ Not Seen    │ → [ /onboarding ] → (Complete) → Set 'true' → [ /welcome ]
 └─────────────┘
      ↓
[ Seen Onboarding ]
      ↓
[ Supabase Session Check ]
 ┌──────────────┬──────────────┐
 │ No Session   │              │ Session Exists
 │              ↓              ↓
 │        [ /welcome ]     [ /(tabs)/home ]
 └────────────────────────────────────────┘




[User A Login] 
      ↓
[User B Login] 
      ↓
[User A Lists Product] 
      ↓
[User B Views Listings] 
      ↓
[User B Initiates Trade Request] 
      ↓
[Notification to User A] 
      ↓
┌───────────────┐
│ User A Views  │
│ Trade Request  │
└───────────────┘
      ↓
┌───────────────┐
│ Accept Trade  │
│ or Reject Trade│
└───────────────┘
      ↓                ↓
[Update Trade Status]   [Update Trade Status]
      ↓                        ↓
[Finalize Trade Details]   [Notify User B]
      ↓
[Complete Transaction]
      ↓
[Update User Profiles]




# barter
# Barter_Project
# Barter_Project
