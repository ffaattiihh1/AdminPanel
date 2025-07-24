enum ProductCategory { giftCard, clothing, electronics, voucher }

class ProductModel {
  final String id;
  final String name;
  final String description;
  final int priceCoins;
  final ProductCategory category;
  final String imageUrl;
  final int stockQuantity;
  final bool isAvailable;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.priceCoins,
    required this.category,
    required this.imageUrl,
    this.stockQuantity = 0,
    this.isAvailable = true,
    required this.createdAt,
    this.metadata,
  });

  // Ürünün stokta olup olmadığını kontrol et
  bool get isInStock => stockQuantity > 0 && isAvailable;

  // Kategori için display name
  String get categoryDisplayName {
    switch (category) {
      case ProductCategory.giftCard:
        return 'Hediye Kartı';
      case ProductCategory.clothing:
        return 'Giyim';
      case ProductCategory.electronics:
        return 'Elektronik';
      case ProductCategory.voucher:
        return 'Voucher';
    }
  }

  // Kategori için icon
  String get categoryIcon {
    switch (category) {
      case ProductCategory.giftCard:
        return '🎁';
      case ProductCategory.clothing:
        return '👕';
      case ProductCategory.electronics:
        return '📱';
      case ProductCategory.voucher:
        return '🎫';
    }
  }

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      priceCoins: json['priceCoins'] ?? 0,
      category: ProductCategory.values.firstWhere(
        (e) => e.toString().split('.').last == json['category'],
        orElse: () => ProductCategory.giftCard,
      ),
      imageUrl: json['imageUrl'] ?? '',
      stockQuantity: json['stockQuantity'] ?? 0,
      isAvailable: json['isAvailable'] ?? true,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'priceCoins': priceCoins,
      'category': category.toString().split('.').last,
      'imageUrl': imageUrl,
      'stockQuantity': stockQuantity,
      'isAvailable': isAvailable,
      'createdAt': createdAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  ProductModel copyWith({
    String? id,
    String? name,
    String? description,
    int? priceCoins,
    ProductCategory? category,
    String? imageUrl,
    int? stockQuantity,
    bool? isAvailable,
    DateTime? createdAt,
    Map<String, dynamic>? metadata,
  }) {
    return ProductModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      priceCoins: priceCoins ?? this.priceCoins,
      category: category ?? this.category,
      imageUrl: imageUrl ?? this.imageUrl,
      stockQuantity: stockQuantity ?? this.stockQuantity,
      isAvailable: isAvailable ?? this.isAvailable,
      createdAt: createdAt ?? this.createdAt,
      metadata: metadata ?? this.metadata,
    );
  }
} 