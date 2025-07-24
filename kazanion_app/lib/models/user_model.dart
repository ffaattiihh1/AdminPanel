class UserModel {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String? phoneNumber;
  final String? profileImageUrl;
  final int totalCoins;
  final int completedTasks;
  final DateTime createdAt;
  final DateTime? lastLoginAt;

  UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.phoneNumber,
    this.profileImageUrl,
    this.totalCoins = 0,
    this.completedTasks = 0,
    required this.createdAt,
    this.lastLoginAt,
  });

  String get fullName => '$firstName $lastName';
  String get displayName => firstName.isNotEmpty ? firstName : email;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    // Backend'den gelen veriyi parçala
    final fullName = json['name'] ?? '';
    final nameParts = fullName.split(' ');
    final firstName = nameParts.isNotEmpty ? nameParts[0] : '';
    final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';
    
    return UserModel(
      id: json['id'].toString(),
      email: json['email'] ?? '',
      firstName: firstName,
      lastName: lastName,
      phoneNumber: json['phoneNumber'],
      profileImageUrl: json['profileImageUrl'],
      totalCoins: json['total_earnings']?.toInt() ?? 0,
      completedTasks: json['completed_surveys'] ?? 0,
      createdAt: json['created_at'] != null 
          ? DateTime.fromMillisecondsSinceEpoch(json['created_at'] * 1000)
          : DateTime.now(),
      lastLoginAt: json['last_login_at'] != null 
          ? DateTime.fromMillisecondsSinceEpoch(json['last_login_at'] * 1000)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'phoneNumber': phoneNumber,
      'profileImageUrl': profileImageUrl,
      'totalCoins': totalCoins,
      'completedTasks': completedTasks,
      'createdAt': createdAt.toIso8601String(),
      'lastLoginAt': lastLoginAt?.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? phoneNumber,
    String? profileImageUrl,
    int? totalCoins,
    int? completedTasks,
    DateTime? createdAt,
    DateTime? lastLoginAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      totalCoins: totalCoins ?? this.totalCoins,
      completedTasks: completedTasks ?? this.completedTasks,
      createdAt: createdAt ?? this.createdAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
    );
  }
} 