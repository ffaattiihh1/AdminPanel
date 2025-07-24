import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';

class StorePage extends StatefulWidget {
  const StorePage({super.key});

  @override
  State<StorePage> createState() => _StorePageState();
}

class _StorePageState extends State<StorePage> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _products = [];

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final response = await http.get(Uri.parse('http://localhost:4000/api/products'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _products = data is List ? data : [];
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'Ürünler alınamadı';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Bağlantı hatası';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        backgroundColor: const Color(0xFF3498DB),
        title: const Text('Mağaza', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.75,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                    ),
                    itemCount: _products.length,
                    itemBuilder: (context, index) {
                      final product = _products[index];
                      return _buildProductCard(product);
                    },
                  ),
                ),
    );
  }

  Widget _buildProductCard(Map<String, dynamic> product) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          // Product Image
          Container(
            height: 120,
            margin: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: product['images'] != null && product['images'].toString().isNotEmpty
                  ? Image.network(json.decode(product['images'])[0], width: 80, height: 80, fit: BoxFit.cover)
                  : Icon(_getProductIcon(product['category']), color: _getProductColor(product['category']), size: 40),
            ),
          ),
          // Product Info
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name'] ?? '',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product['description'] ?? '',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Spacer(),
                  Text(
                    '${product['price']} TL',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF3498DB)),
                  ),
                  Text(
                    'Stok: ${product['stock']}',
                    style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(12),
            child: ElevatedButton(
              onPressed: () => _showProductDetail(product),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3498DB),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.symmetric(vertical: 8),
              ),
              child: const Text('Sepete Ekle', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  Color _getProductColor(String? category) {
    switch (category) {
      case 'Hediye Kartı':
        return Colors.orange;
      case 'Abonelik':
        return Colors.red;
      case 'Giyim':
        return const Color(0xFF3498DB);
      default:
        return Colors.grey;
    }
  }

  IconData _getProductIcon(String? category) {
    switch (category) {
      case 'Hediye Kartı':
        return Icons.card_giftcard;
      case 'Abonelik':
        return Icons.subscriptions;
      case 'Giyim':
        return Icons.checkroom;
      default:
        return Icons.shopping_bag;
    }
  }

  void _showProductDetail(Map<String, dynamic> product) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _ProductDetailModal(product: product),
    );
  }
}

class _ProductDetailModal extends StatefulWidget {
  final Map<String, dynamic> product;
  const _ProductDetailModal({required this.product});

  @override
  State<_ProductDetailModal> createState() => _ProductDetailModalState();
}

class _ProductDetailModalState extends State<_ProductDetailModal> {
  String? selectedSize;
  String? selectedColor;
  int quantity = 1;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final variants = product['variants'] ?? [];
    final sizes = variants.map((v) => v['size']).toSet().toList();
    final colors = variants.map((v) => v['color']).toSet().toList();
    int stock = 0;
    if (selectedSize != null && selectedColor != null) {
      final v = variants.firstWhere(
        (v) => v['size'] == selectedSize && v['color'] == selectedColor,
        orElse: () => null,
      );
      stock = v != null ? (v['stock'] ?? 0) : 0;
    } else {
      stock = variants.fold(0, (sum, v) => sum + (v['stock'] ?? 0));
    }
    final price = product['price'] ?? 0;
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(top: 8),
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: product['images'] != null && product['images'].toString().isNotEmpty
                        ? Image.network(json.decode(product['images'])[0], width: 120, height: 120, fit: BoxFit.cover)
                        : Icon(Icons.shopping_bag, size: 60, color: Colors.grey),
                  ),
                  const SizedBox(height: 20),
                  Text(product['name'] ?? '', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87)),
                  const SizedBox(height: 8),
                  Text(product['description'] ?? '', style: TextStyle(fontSize: 16, color: Colors.grey.shade600)),
                  const SizedBox(height: 20),
                  Text('$price TL', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF3498DB))),
                  const SizedBox(height: 20),
                  if (sizes.isNotEmpty) ...[
                    const Text('Beden Seçin:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 10,
                      children: List.generate(sizes.length, (i) {
                        final size = sizes[i];
                        return ChoiceChip(
                          label: Text(size),
                          selected: selectedSize == size,
                          onSelected: (selected) => setState(() => selectedSize = selected ? size : null),
                          selectedColor: const Color(0xFF3498DB),
                          labelStyle: TextStyle(color: selectedSize == size ? Colors.white : Colors.black),
                        );
                      }),
                    ),
                    const SizedBox(height: 20),
                  ],
                  if (colors.isNotEmpty) ...[
                    const Text('Renk Seçin:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 10,
                      children: List.generate(colors.length, (i) {
                        final color = colors[i];
                        return ChoiceChip(
                          label: Text(color),
                          selected: selectedColor == color,
                          onSelected: (selected) => setState(() => selectedColor = selected ? color : null),
                          selectedColor: const Color(0xFF3498DB),
                          labelStyle: TextStyle(color: selectedColor == color ? Colors.white : Colors.black),
                        );
                      }),
                    ),
                    const SizedBox(height: 20),
                  ],
                  Row(
                    children: [
                      Icon(Icons.inventory, color: Colors.grey.shade600, size: 20),
                      const SizedBox(width: 8),
                      Text('Stok: $stock adet', style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      const Text('Adet: '),
                      IconButton(
                        icon: const Icon(Icons.remove),
                        onPressed: quantity > 1 ? () => setState(() => quantity--) : null,
                      ),
                      Text('$quantity', style: const TextStyle(fontWeight: FontWeight.bold)),
                      IconButton(
                        icon: const Icon(Icons.add),
                        onPressed: quantity < stock ? () => setState(() => quantity++) : null,
                      ),
                    ],
                  ),
                  if (_error != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(_error!, style: const TextStyle(color: Colors.red)),
                    ),
                ],
              ),
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            child: ElevatedButton(
              onPressed: quantity > 0 && selectedSize != null && selectedColor != null
                  ? () async {
                      final authService = Provider.of<AuthService>(context, listen: false);
                      final userId = authService.currentUser?.id;
                      if (userId == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Kullanıcı bulunamadı. Lütfen giriş yapın.'),
                            backgroundColor: Colors.red,
                            duration: Duration(seconds: 2),
                          ),
                        );
                        return;
                      }
                      final api = ApiService.instance;
                      final result = await api.purchaseProduct(
                        productId: product['id'],
                        userId: userId.toString(),
                        size: selectedSize!,
                        color: selectedColor!,
                        quantity: quantity,
                      );
                      if (result['success'] == true) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${product['name']} başarıyla satın alındı!'),
                            backgroundColor: Colors.green,
                            duration: const Duration(seconds: 2),
                          ),
                        );
                        Navigator.of(context).pop();
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(result['message'] ?? 'Satın alma başarısız'),
                            backgroundColor: Colors.red,
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      }
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3498DB),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                disabledBackgroundColor: Colors.grey.shade300,
              ),
              child: Text(quantity > 0 && selectedSize != null && selectedColor != null ? 'Satın Al' : 'Seçim Yapın / Stok Yok', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
} 