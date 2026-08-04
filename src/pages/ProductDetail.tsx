import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { mockProducts } from '../data/mockData';
import { useAppStore } from '../store/useAppStore';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = mockProducts.find(p => p.id === id);
  const addToCart = useAppStore(state => state.addToCart);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center" style={{ background: '#FAF7F2' }}>
        <h1 className="heading-lg mb-4">Pièce Introuvable</h1>
        <p className="body-refined mb-8">Cette création n'est plus disponible ou a été retirée de la collection.</p>
        <Link to="/shop" className="btn-gold">Retour à la Collection</Link>
      </div>
    );
  }

  const relatedProducts = mockProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Veuillez sélectionner une taille.');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Veuillez sélectionner une couleur.');
      return;
    }
    
    addToCart({
      product,
      quantity,
      selectedSize,
      selectedColor
    });
    toast.success('Ajouté à votre panier d\'exception.');
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F2', paddingBottom: '100px' }}>
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 pt-10">
        {/* Left: Image */}
        <div className="relative">
          <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-center py-10 lg:py-20 lg:sticky lg:top-28 lg:h-fit">
          <p className="overline-text mb-4" style={{ color: '#C9A84C' }}>{product.category}</p>
          <h1 className="heading-lg mb-6">{product.name}</h1>
          <p className="body-refined mb-8" style={{ color: '#555', fontSize: '0.95rem' }}>{product.description}</p>
          
          <p className="font-display mb-10" style={{ color: '#C9A84C', fontSize: '2.5rem' }}>
            ${product.price.toLocaleString()}
          </p>

          <div className="line-gold mb-10" style={{ width: '100px' }} />

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-8">
              <p className="overline-text mb-4" style={{ color: '#3A3A3A' }}>Couleur</p>
              <div className="flex gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="px-4 py-2 border transition-colors"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                      borderColor: selectedColor === color ? '#eb1e7a' : 'rgba(58,58,58,0.2)',
                      color: selectedColor === color ? '#eb1e7a' : '#3A3A3A',
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-10">
              <p className="overline-text mb-4" style={{ color: '#3A3A3A' }}>Taille</p>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="px-4 py-2 border transition-colors"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                      borderColor: selectedSize === size ? '#eb1e7a' : 'rgba(58,58,58,0.2)',
                      color: selectedSize === size ? '#eb1e7a' : '#3A3A3A',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex gap-4 mb-8">
            <div className="flex items-center border" style={{ borderColor: 'rgba(58,58,58,0.2)' }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3" style={{ color: '#3A3A3A' }}>-</button>
              <span className="w-8 text-center font-body" style={{ color: '#3A3A3A' }}>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-3" style={{ color: '#3A3A3A' }}>+</button>
            </div>
            <button onClick={handleAddToCart} className="btn-primary flex-1 justify-center">
              <span>Ajouter au Panier</span>
            </button>
          </div>
          
          <button className="btn-gold justify-center w-full">
            <span>Couture sur Mesure</span>
          </button>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 mt-32">
          <div className="divider-gold mb-12">
            <h2 className="heading-md">Pièces Similaires</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <Link key={p.id} to={`/shop/${p.id}`} className="product-card group" style={{ aspectRatio: '3/4', display: 'block' }}>
                <img src={p.image} alt={p.name} className="product-card-img absolute inset-0 w-full h-full" />
                <div className="product-card-overlay">
                  <div>
                    <p className="overline-text mb-1" style={{ color: '#C9A84C' }}>{p.category}</p>
                    <p className="font-display text-white text-xl font-light">{p.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
