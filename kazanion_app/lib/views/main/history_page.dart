import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';

class HistoryPage extends StatefulWidget {
  const HistoryPage({super.key});

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  String? _error;
  List<dynamic> _earned = [];
  List<dynamic> _friends = [];
  List<dynamic> _incomplete = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final userId = authService.currentUser?.id;
      if (userId == null) {
        setState(() {
          _error = 'Kullanıcı bulunamadı';
          _isLoading = false;
        });
        return;
      }
      final api = ApiService.instance;
      final data = await api.getHistory(userId.toString());
      setState(() {
        _earned = data['earned'] ?? [];
        _friends = data['friends'] ?? [];
        _incomplete = data['incomplete'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Geçmiş alınamadı';
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFF3498DB),
        title: const Text('Tarihçe', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          tabs: const [
            Tab(text: 'KAZANDIĞIM'),
            Tab(text: 'ARKADAŞLARIM'),
            Tab(text: 'YARIM KALAN'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildEarnedTab(),
                    _buildFriendsTab(),
                    _buildIncompleteTab(),
                  ],
                ),
    );
  }

  Widget _buildEarnedTab() {
    if (_earned.isEmpty) {
      return Center(
        child: Text(
          'Henüz kazandığın anket yok',
          style: TextStyle(color: Colors.grey.shade500, fontSize: 16),
        ),
      );
    }
    return ListView.builder(
      itemCount: _earned.length,
      itemBuilder: (context, index) {
        final item = _earned[index];
        return ListTile(
          leading: const Icon(Icons.check_circle, color: Colors.green),
          title: Text(item['title'] ?? ''),
          subtitle: Text(item['date'] ?? ''),
          trailing: Text('+${item['points']} puan', style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
        );
      },
    );
  }

  Widget _buildFriendsTab() {
    if (_friends.isEmpty) {
      return Center(
        child: Text(
          'Henüz arkadaş aktivitesi yok',
          style: TextStyle(color: Colors.grey.shade500, fontSize: 16),
        ),
      );
    }
    return ListView.builder(
      itemCount: _friends.length,
      itemBuilder: (context, index) {
        final item = _friends[index];
        return ListTile(
          leading: const Icon(Icons.person, color: Colors.orange),
          title: Text(item['friend'] ?? ''),
          subtitle: Text(item['action'] ?? ''),
          trailing: Text(item['date'] ?? ''),
        );
      },
    );
  }

  Widget _buildIncompleteTab() {
    if (_incomplete.isEmpty) {
      return Center(
        child: Text(
          'Yarım kalan anketin yok',
          style: TextStyle(color: Colors.grey.shade500, fontSize: 16),
        ),
      );
    }
    return ListView.builder(
      itemCount: _incomplete.length,
      itemBuilder: (context, index) {
        final item = _incomplete[index];
        return ListTile(
          leading: const Icon(Icons.hourglass_empty, color: Colors.grey),
          title: Text(item['title'] ?? ''),
          subtitle: Text(item['startedAt'] ?? ''),
        );
      },
    );
  }
} 