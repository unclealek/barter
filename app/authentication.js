import { StyleSheet } from 'react-native';


// Shared Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 5,
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5A4C77',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderColor: '#5A4C77',
  },
  tabText: {
    fontSize: 18,
    color: '#666',
  },
  activeTabText: {
    color: '#5A4C77',
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(90, 76, 119, 0.2)',
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotButton: {
    marginTop: 20,
    padding: 10,
  },
  forgotButtonText: {
    color: '#5A4C77',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#5A4C77',
    fontSize: 16,
    marginLeft: 5,
    fontWeight: '500',
  },
  GoogleButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
});


export default styles;