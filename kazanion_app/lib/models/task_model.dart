import 'package:geolocator/geolocator.dart';

enum TaskType { survey, location, photo, shopping }
enum TaskStatus { available, inProgress, completed, expired }

class TaskModel {
  final String id;
  final String title;
  final String description;
  final TaskType type;
  final TaskStatus status;
  final int rewardCoins;
  final double latitude;
  final double longitude;
  final String? imageUrl;
  final DateTime createdAt;
  final DateTime? expiresAt;
  final Duration? timeLimit;
  final double? requiredDistance; // Metre cinsinden
  final Map<String, dynamic>? metadata;

  TaskModel({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    this.status = TaskStatus.available,
    required this.rewardCoins,
    required this.latitude,
    required this.longitude,
    this.imageUrl,
    required this.createdAt,
    this.expiresAt,
    this.timeLimit,
    this.requiredDistance,
    this.metadata,
  });

  // Kullanıcının konumu ile görevin konumu arasındaki mesafeyi hesapla
  double distanceFromUser(double userLat, double userLng) {
    return Geolocator.distanceBetween(
      userLat,
      userLng,
      latitude,
      longitude,
    );
  }

  // Görevin süresinin dolup dolmadığını kontrol et
  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }

  // Görevin aktif olup olmadığını kontrol et
  bool get isActive {
    return status == TaskStatus.available && !isExpired;
  }

  // Görev tipi için icon
  String get typeIcon {
    switch (type) {
      case TaskType.survey:
        return '📝';
      case TaskType.location:
        return '📍';
      case TaskType.photo:
        return '📷';
      case TaskType.shopping:
        return '🛒';
    }
  }

  // Görev tipi için açıklama
  String get typeDisplayName {
    switch (type) {
      case TaskType.survey:
        return 'Anket';
      case TaskType.location:
        return 'Konum';
      case TaskType.photo:
        return 'Fotoğraf';
      case TaskType.shopping:
        return 'Alışveriş';
    }
  }

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    return TaskModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      type: TaskType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
        orElse: () => TaskType.survey,
      ),
      status: TaskStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => TaskStatus.available,
      ),
      rewardCoins: json['rewardCoins'] ?? 0,
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      imageUrl: json['imageUrl'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      expiresAt: json['expiresAt'] != null 
          ? DateTime.parse(json['expiresAt']) 
          : null,
      timeLimit: json['timeLimit'] != null 
          ? Duration(minutes: json['timeLimit']) 
          : null,
      requiredDistance: json['requiredDistance']?.toDouble(),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type.toString().split('.').last,
      'status': status.toString().split('.').last,
      'rewardCoins': rewardCoins,
      'latitude': latitude,
      'longitude': longitude,
      'imageUrl': imageUrl,
      'createdAt': createdAt.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
      'timeLimit': timeLimit?.inMinutes,
      'requiredDistance': requiredDistance,
      'metadata': metadata,
    };
  }

  TaskModel copyWith({
    String? id,
    String? title,
    String? description,
    TaskType? type,
    TaskStatus? status,
    int? rewardCoins,
    double? latitude,
    double? longitude,
    String? imageUrl,
    DateTime? createdAt,
    DateTime? expiresAt,
    Duration? timeLimit,
    double? requiredDistance,
    Map<String, dynamic>? metadata,
  }) {
    return TaskModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      type: type ?? this.type,
      status: status ?? this.status,
      rewardCoins: rewardCoins ?? this.rewardCoins,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      imageUrl: imageUrl ?? this.imageUrl,
      createdAt: createdAt ?? this.createdAt,
      expiresAt: expiresAt ?? this.expiresAt,
      timeLimit: timeLimit ?? this.timeLimit,
      requiredDistance: requiredDistance ?? this.requiredDistance,
      metadata: metadata ?? this.metadata,
    );
  }
} 