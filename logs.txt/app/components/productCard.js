import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const { width } = Dimensions.get('window');

export default function ProductCard({ product, onPress, onFavoritePress, isFavorite }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${product?.name}`}
    >
      <Image
        source={{ uri: product?.images?.[0] || 'https://via.placeholder.com/150' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {product?.name || 'Unknown Product'}
          </Text>
          <TouchableOpacity
            onPress={onFavoritePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? `Remove ${product?.name} from favorites`
                : `Add ${product?.name} to favorites`
            }
          >
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={24}
              color={isFavorite ? '#ff4444' : '#000'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.category}>{product?.category || 'Uncategorized'}</Text>
        {product?.rating ? (
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <FontAwesome
                key={i}
                name={i < product.rating ? 'star' : 'star-o'}
                size={16}
                color="#FFD700"
              />
            ))}
          </View>
        ) : (
          <Text style={styles.noRating}>No reviews yet</Text>
        )}
        <Text style={styles.condition}>Condition: {product?.condition || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    images: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
    category: PropTypes.string,
    rating: PropTypes.number,
    condition: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  onFavoritePress: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: width * 0.9,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  noRating: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  condition: {
    fontSize: 14,
    color: '#333',
    marginTop: 6,
  },
});
