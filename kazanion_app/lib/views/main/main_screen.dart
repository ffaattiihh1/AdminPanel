import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import '../story/story_viewer.dart';
import 'store_page.dart';
import 'package:provider/provider.dart';
import 'history_page.dart';
import 'explore_page.dart';
import 'leaderboard_page.dart';
import 'profile_page.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;
  List<Map<String, dynamic>> _surveys = [];
  List<Map<String, dynamic>> _stories = [];
  Map<String, dynamic>? _userProfile;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final apiService = ApiService.instance;

      // Kullanıcı profilini getir
      if (authService.currentUser != null) {
        final profile = await apiService.getUserProfile(
          authService.currentUser!.id,
        );
        if (profile != null) {
          setState(() {
            _userProfile = profile;
          });
        }
      }

      // Anketleri getir
      final surveys = await apiService.getSurveys();

      // Hikayeleri getir
      final stories = await apiService.getStories();

      setState(() {
        _surveys = surveys;
        _stories = stories;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Veri yüklenirken hata: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _openStoryViewer(int initialIndex) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) =>
            StoryViewer(stories: _stories, initialIndex: initialIndex),
      ),
    );
  }

  Widget _buildCurrentPage() {
    switch (_selectedIndex) {
      case 0:
        return _buildHomePage();
      case 1:
        return _buildHistoryPage();
      case 2:
        return _buildExplorePage();
      case 3:
        return _buildLeaderboardPage();
      case 4:
        return _buildProfilePage();
      default:
        return _buildHomePage();
    }
  }

  Widget _buildHomePage() {
    return SingleChildScrollView(
          child: Column(
            children: [
              // Header with logo
              Container(
                padding: const EdgeInsets.all(20),
                color: Colors.white,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      'assets/images/ic_kazanion_logo.png',
                      height: 40,
                      errorBuilder: (context, error, stackTrace) {
                        return const SizedBox(
                          height: 40,
                          child: Text(
                            'KazaniOn',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue,
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              // User info card
              Container(
                margin: const EdgeInsets.all(20),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2196F3), Color(0xFF1976D2)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Row(
                  children: [
                    // Profile image
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(30),
                        image: _userProfile?['profileImage'] != null
                            ? DecorationImage(
                                image: NetworkImage(
                                  _userProfile!['profileImage'],
                                ),
                                fit: BoxFit.cover,
                              )
                            : null,
                      ),
                      child: _userProfile?['profileImage'] == null
                          ? const Icon(
                              Icons.person,
                              color: Colors.grey,
                              size: 30,
                            )
                          : null,
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _userProfile?['name'] != null && _userProfile!['name'].toString().isNotEmpty
                              ? _userProfile!['name'].toString().split(' ')[0][0].toUpperCase() + _userProfile!['name'].toString().split(' ')[0].substring(1).toLowerCase()
                              : 'Kullanıcı',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            '${_userProfile?['points'] ?? 0} Puan',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            '${_userProfile?['earnings'] ?? '0.00'} TL',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Action buttons
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: _buildActionButton(
                        'Mağaza',
                        Icons.store,
                        Colors.blue,
                        () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const StorePage(),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: _buildActionButton(
                        'Para Çek',
                        Icons.attach_money,
                        Colors.green,
                        () {
                          // Para çekme sayfasına git
                        },
                      ),
                    ),
                  ],
                ),
              ),

              // Story buttons - Sadece hikaye varsa göster
              if (_stories.isNotEmpty) ...[
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: _stories.asMap().entries.map((entry) {
                      final index = entry.key;
                      final story = entry.value;
                      return _buildStoryButton(
                        story['title'],
                        !(story['isViewed'] ?? false),
                        Color(
                          int.parse(
                            story['backgroundColor'].replaceFirst('#', '0xFF'),
                          ),
                        ),
                        () => _openStoryViewer(index),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 30),
              ] else
                const SizedBox(height: 20),

              // Active surveys title
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Aktif Anketler',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 15),

              // Survey list
              if (_surveys.isNotEmpty)
                ..._surveys.map((survey) => _buildSurveyItem(survey))
              else
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  padding: const EdgeInsets.all(40),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.poll_outlined,
                        size: 50,
                        color: Colors.grey.shade400,
                      ),
                      const SizedBox(height: 15),
                      Text(
                        'Henüz aktif anket bulunmuyor',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey.shade600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Yeni anketler için takipte kalın!',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 20),

              // Social media section
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Sosyal Medya',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 15),

              // Social media buttons
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildSocialButton(
                      'Instagram',
                      Colors.pink,
                      Icons.camera_alt,
                    ),
                    _buildSocialButton(
                      'Twitter',
                      Colors.blue,
                      Icons.alternate_email,
                    ),
                    _buildSocialButton(
                      'Facebook',
                      Colors.indigo,
                      Icons.facebook,
                    ),
                    _buildSocialButton('YouTube', Colors.red, Icons.play_arrow),
                  ],
                ),
              ),

              const SizedBox(height: 100), // Bottom navigation space
            ],
          ),
        );
  }

  Widget _buildHistoryPage() {
    return const HistoryPage();
  }

  Widget _buildExplorePage() {
    return const ExplorePage();
  }

  Widget _buildLeaderboardPage() {
    return const LeaderboardPage();
  }

  Widget _buildProfilePage() {
    return const ProfilePage();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(child: _buildCurrentPage()),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Ana Sayfa'),
          BottomNavigationBarItem(icon: Icon(Icons.history), label: 'Tarihçe'),
          BottomNavigationBarItem(icon: Icon(Icons.explore), label: 'Keşfet'),
          BottomNavigationBarItem(icon: Icon(Icons.leaderboard), label: 'Sıralama'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }

  Widget _buildActionButton(
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 8),
            Text(
              title,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStoryButton(
    String title,
    bool hasNewStory,
    Color color,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(30),
              border: Border.all(
                color: hasNewStory ? Colors.blue : Colors.grey.shade300,
                width: 3,
              ),
            ),
            child: const Icon(Icons.star, color: Colors.white, size: 30),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: 70,
            child: Text(
              title,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (hasNewStory)
            Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Colors.blue,
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSurveyItem(Map<String, dynamic> survey) {
    return Column(
      children: [
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          padding: const EdgeInsets.all(15),
          child: Row(
            children: [
              // Survey icon
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Icon(
                  _getSurveyIcon(survey['icon'] ?? ''),
                  color: Colors.blue,
                  size: 25,
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      survey['title'] ?? '',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      survey['description'] ?? '',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${survey['reward'] ?? 0} Puan',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.green,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.orange.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${((survey['reward'] ?? 0) / 10).toStringAsFixed(2)} TL',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.orange,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, color: Colors.grey, size: 16),
            ],
          ),
        ),
        // Blue divider
        Container(
          height: 1,
          margin: const EdgeInsets.symmetric(horizontal: 20),
          color: Colors.blue.withOpacity(0.3),
        ),
      ],
    );
  }

  Widget _buildSocialButton(String name, Color color, IconData icon) {
    return Column(
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(25),
          ),
          child: Icon(icon, color: Colors.white, size: 25),
        ),
        const SizedBox(height: 8),
        Text(
          name,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  IconData _getSurveyIcon(String? iconName) {
    switch (iconName) {
      case 'shopping_cart':
        return Icons.shopping_cart;
      case 'map':
        return Icons.map;
      case 'music_note':
        return Icons.music_note;
      case 'sports_soccer':
        return Icons.sports_soccer;
      default:
        return Icons.poll;
    }
  }
}
