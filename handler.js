const fs = require('fs');
const path = require('path');
const DB_FILE = path.join(__dirname, 'products.json');

// Leer productos del archivo
function readDB() {
  if (!fs.existsSync(DB_FILE)) return [];
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch(e) {
    console.error('Error leyendo DB:', e);
    return [];
  }
}

// Escribir productos al archivo
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const createResponse = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

// Crear producto
module.exports.createProduct = async (event) => {
  try {
    const { id, nombre, descripcion, precio } = JSON.parse(event.body);
    const products = readDB();
    // Evitar IDs duplicados (opcional)
    if (products.find(p => p.id === id)) {
      return createResponse(400, { error: "Ya existe un producto con ese ID" });
    }
    const newProduct = { id, nombre, descripcion, precio };
    products.push(newProduct);
    writeDB(products);
    return createResponse(201, { message: "Producto creado", product: newProduct });
  } catch (error) {
    console.error(error);
    return createResponse(500, { error: "No se pudo crear el producto" });
  }
};

// Listar todos
module.exports.getProducts = async () => {
  try {
    const products = readDB();
    return createResponse(200, products);
  } catch (error) {
    console.error(error);
    return createResponse(500, { error: "No se pudo obtener los productos" });
  }
};

// Obtener por ID
module.exports.getProductById = async (event) => {
  try {
    const { id } = event.pathParameters;
    const products = readDB();
    const product = products.find(p => p.id === id);
    if (!product) return createResponse(404, { error: "Producto no encontrado" });
    return createResponse(200, product);
  } catch (error) {
    console.error(error);
    return createResponse(500, { error: "No se pudo obtener el producto" });
  }
};

// Actualizar producto
module.exports.updateProduct = async (event) => {
  try {
    const { id } = event.pathParameters;
    const { nombre, descripcion, precio } = JSON.parse(event.body);
    const products = readDB();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return createResponse(404, { error: "Producto no encontrado" });
    products[index] = { ...products[index], nombre, descripcion, precio };
    writeDB(products);
    return createResponse(200, { message: "Producto actualizado", product: products[index] });
  } catch (error) {
    console.error(error);
    return createResponse(500, { error: "No se pudo actualizar el producto" });
  }
};

// Eliminar producto
module.exports.deleteProduct = async (event) => {
  try {
    const { id } = event.pathParameters;
    let products = readDB();
    const newProducts = products.filter(p => p.id !== id);
    if (products.length === newProducts.length) {
      return createResponse(404, { error: "Producto no encontrado" });
    }
    writeDB(newProducts);
    return createResponse(200, { message: "Producto eliminado" });
  } catch (error) {
    console.error(error);
    return createResponse(500, { error: "No se pudo eliminar el producto" });
  }
};
