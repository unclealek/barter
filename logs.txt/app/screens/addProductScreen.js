import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';
import { useRouter } from 'expo-router';

export default function AddProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: null,
    condition: 'New',
    images: [],
    rating: 0,
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Hardcoded Categories
  const categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Home Appliances' },
    { id: 4, name: 'Books' },
    { id: 5, name: 'Furniture' },
  ];

  // ✅ Hardcoded Conditions
  const conditions = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'];

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const images = result.assets ? result.assets : [result];
        setSelectedImages((prev) => [...prev, ...images]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      setError('Failed to pick images');
    }
  };

  const uploadImageToSupabase = async (imageBase64) => {
    try {
      if (!imageBase64) throw new Error('No image data');

      const fileName = `${Math.random()}.jpg`;
      const filePath = `products/${fileName}`;
      const arrayBuffer = decode(imageBase64);

      const { data, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, arrayBuffer, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleStarPress = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      category_id: categoryId,
    }));
  };

  const handleConditionSelect = (condition) => {
    setFormData((prev) => ({
      ...prev,
      condition,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (!formData.name || !formData.category_id || !formData.condition || selectedImages.length === 0) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const imageUrls = await Promise.all(
        selectedImages.map((img) => uploadImageToSupabase(img.base64))
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('products').insert({
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        condition: formData.condition,
        images: imageUrls,
        rating: formData.rating,
        user_id: user.id,
      });

      if (error) throw error;

      setFormData({
        name: '',
        description: '',
        category_id: null,
        condition: 'New',
        images: [],
        rating: 0,
      });
      setSelectedImages([]);
      Alert.alert('Success', 'Product added successfully!');
      router.back();
    } catch (error) {
      console.error('Submission error:', error);
      setError(error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
     <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.bodyContainer}>
        {/* ✅ Image Picker */}
        <TouchableOpacity style={styles.imageContainer} onPress={handleImagePick}>
          {selectedImages.length > 0 ? (
            <View style={styles.imageGrid}>
              {selectedImages.map((img, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.clearImageButton}
                    onPress={() =>
                      setSelectedImages((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Ionicons name="close-circle" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={40} color="#666" />
              <Text style={styles.imagePlaceholderText}>Add Product Images</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Product Name */}
        <Text style={styles.label}>Product Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
          placeholder="Enter product name"
        />

        {/* Description */}
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
          placeholder="Enter product description"
          multiline
          numberOfLines={4}
        />

        {/* Rating */}
        <Text style={styles.label}>Rating *</Text>
        <View style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
              <Ionicons
                name={star <= formData.rating ? 'star' : 'star-outline'}
                size={32}
                color={star <= formData.rating ? '#FFD700' : '#666'}
            />
          </TouchableOpacity>
        ))}
      </View>

        {/* Category */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                formData.category_id === category.id && styles.selectedCategoryButton,
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  formData.category_id === category.id && styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ✅ Condition Selection */}
        <Text style={styles.label}>Condition *</Text>
        <View style={styles.conditionContainer}>
          {conditions.map((cond) => (
            <TouchableOpacity
              key={cond}
              style={[
                styles.conditionButton,
                formData.condition === cond && styles.selectedConditionButton,
              ]}
              onPress={() => handleConditionSelect(cond)}
            >
              <Text
                style={[
                  styles.conditionButtonText,
                  formData.condition === cond && styles.selectedConditionText,
                ]}
              >
                {cond}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ccc" />
          ) : (
            <Text style={styles.submitButtonText}>Add Product</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A4C77',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    transform: [{ scale: 1 }],
  },
  backButtonText: {
    color: '#ccc',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '700',
  },
  bodyContainer: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  // ✅ Image Picker Styles
  imageContainer: {
    minHeight: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  imagePreviewContainer: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: { width: '100%', height: '100%' },
  clearImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    padding: 2,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholderText: { marginTop: 10, color: '#666', fontSize: 16 },

  starContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
  },
  starButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  // ✅ Category & Condition Styles
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryButton: { backgroundColor: '#5A4C77' },
  categoryButtonText: { color: '#333', fontSize: 14 },
  selectedCategoryText: { color: '#fff' },

  conditionContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  conditionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedConditionButton: { backgroundColor: '#5A4C77' },
  conditionButtonText: { color: '#333', fontSize: 14 },
  selectedConditionText: { color: '#fff' },

  submitButton: {
    backgroundColor: '#5A4C77',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#ff4444', marginTop: 12, textAlign: 'center' },
});
