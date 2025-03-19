import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    width: 200,
    backgroundColor: '#F9F9F9',
    marginEnd: 12,
    borderRadius: 15,
  },
  imageContainer: {
    flex: 1,
    marginLeft: 15,
    marginTop: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  image: {
    aspectRatio: 1,  // Giữ tỷ lệ ảnh vuông
    resizeMode: 'cover',
    borderRadius: 15,
    width: '100%',
    height: '100%',
  },
  details: {
    padding: 10, 
  },
  title: {
    fontWeight: 'bold', 
    fontSize: 18,
    color: '#333',
    marginBottom: 2,
  },
  supplier: {
    fontWeight: 'regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#E63946',
    marginBottom: 2,
  },
  addBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'green',
    width: 30, 
    height: 30,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowRadius: 4,
    marginEnd:10

  },
  
});

export default styles;
