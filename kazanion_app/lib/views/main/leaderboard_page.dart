import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class LeaderboardPage extends StatefulWidget {
  const LeaderboardPage({super.key});

  @override
  State<LeaderboardPage> createState() => _LeaderboardPageState();
}

class _LeaderboardPageState extends State<LeaderboardPage> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _users = [];

  @override
  void initState() {
    super.initState();
    _fetchLeaderboard();
  }

  Future<void> _fetchLeaderboard() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final api = ApiService.instance;
      final data = await api.getLeaderboard();
      setState(() {
        _users = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Sıralama alınamadı';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFF3498DB),
        title: const Text('Sıralama', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : _users.isEmpty
                  ? const Center(child: Text('Sıralama verisi yok'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildTopThree(),
                          const SizedBox(height: 20),
                          _buildLeaderboardList(),
                        ],
                      ),
                    ),
    );
  }

  Widget _buildTopThree() {
    if (_users.length < 3) return const SizedBox.shrink();
    final topUsers = _users.take(3).toList();
    final medals = [Colors.amber, Colors.grey.shade400, Colors.brown.shade400];
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: List.generate(3, (i) => _buildTopUserCard(topUsers[i], medals[i], i + 1)),
    );
  }

  Widget _buildTopUserCard(Map<String, dynamic> user, Color medalColor, int rank) {
    return Container(
      width: rank == 1 ? 100 : 80,
      child: Column(
        children: [
          Container(
            width: rank == 1 ? 60 : 50,
            height: rank == 1 ? 60 : 50,
            decoration: BoxDecoration(color: medalColor, shape: BoxShape.circle),
            child: const Icon(Icons.emoji_events, color: Colors.white, size: 30),
          ),
          const SizedBox(height: 8),
          CircleAvatar(
            radius: rank == 1 ? 25 : 20,
            backgroundColor: Colors.blue.shade100,
            child: const Icon(Icons.person, color: Colors.blue),
          ),
          const SizedBox(height: 8),
          Text(user['name']?.toString().split(' ')[0] ?? '', style: TextStyle(fontSize: rank == 1 ? 14 : 12, fontWeight: FontWeight.bold)),
          Text('${user['total_earnings'] ?? 0} puan', style: TextStyle(fontSize: rank == 1 ? 12 : 10, color: Colors.grey.shade600)),
          if (user['badge'] != null)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: _buildBadge(user['badge']),
            ),
        ],
      ),
    );
  }

  Widget _buildLeaderboardList() {
    final others = _users.length > 3 ? _users.sublist(3) : [];
    return Column(
      children: List.generate(others.length, (i) => _buildLeaderboardItem(others[i], i + 4)),
    );
  }

  Widget _buildLeaderboardItem(Map<String, dynamic> user, int rank) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(color: Colors.blue.shade100, shape: BoxShape.circle),
            child: Center(child: Text('$rank', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue))),
          ),
          const SizedBox(width: 16),
          CircleAvatar(
            radius: 20,
            backgroundColor: Colors.grey.shade200,
            child: const Icon(Icons.person, color: Colors.grey),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user['name'] ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                Text('${user['total_earnings'] ?? 0} puan', style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
              ],
            ),
          ),
          if (user['badge'] != null)
            _buildBadge(user['badge']),
        ],
      ),
    );
  }

  Widget _buildBadge(String badge) {
    switch (badge) {
      case 'gold':
        return const Icon(Icons.emoji_events, color: Colors.amber, size: 20);
      case 'silver':
        return const Icon(Icons.emoji_events, color: Colors.grey, size: 20);
      case 'bronze':
        return const Icon(Icons.emoji_events, color: Color(0xFFCD7F32), size: 20);
      default:
        return const SizedBox.shrink();
    }
  }
} 