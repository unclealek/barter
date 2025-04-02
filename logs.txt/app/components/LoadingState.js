export function LoadingState({ message = 'Loading...' }) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    );
  }