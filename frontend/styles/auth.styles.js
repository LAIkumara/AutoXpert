import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  title: {
    color: "red",
    fontSize: 50,
    marginBottom: 20,
  },
  button: {
    borderRadius: 10, // Adjust this value to change the roundness of the button
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  uploadButton: {
    backgroundColor: '#2196F3', // Blue color for upload button
  },
  captureButton: {
    backgroundColor: '#4CAF50', // Green color for capture button
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  
});
