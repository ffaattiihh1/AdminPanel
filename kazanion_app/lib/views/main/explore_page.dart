import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class ExplorePage extends StatefulWidget {
  const ExplorePage({super.key});

  @override
  State<ExplorePage> createState() => _ExplorePageState();
}

class _ExplorePageState extends State<ExplorePage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  String? _error;
  List<dynamic> _tasks = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchTasks();
  }

  Future<void> _fetchTasks() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final api = ApiService.instance;
      final data = await api.getMapTasks();
      setState(() {
        _tasks = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Görevler alınamadı';
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
        title: const Text('Keşfet', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          tabs: const [
            Tab(text: 'HARİTA'),
            Tab(text: 'LİSTE'),
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
                    _buildMapTab(),
                    _buildListTab(),
                  ],
                ),
    );
  }

  Widget _buildMapTab() {
    // Gerçek harita yerine placeholder (Google Maps/Flutter Map entegrasyonu eklenebilir)
    if (_tasks.isEmpty) {
      return Center(child: Text('Haritada gösterilecek görev yok', style: TextStyle(color: Colors.grey.shade500)));
    }
    return Column(
      children: [
        Expanded(
          child: Container(
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Text('Harita entegrasyonu burada olacak\n(Görev markerları ile)',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade600)),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            'Konum Bazlı Anketler Hakkında\n\nKonum bazlı anketler, belirli yerlerde bulunan hizmetler ve mekanlar hakkında görüşlerinizi paylaşabileceğiniz özel anketlerdir. Bu anketleri tamamlayarak daha fazla puan kazanabilirsiniz. Haritada görünen konumlardaki anketlere katılarak değerli geri bildirimlerinizi paylaşın.',
            style: TextStyle(color: Colors.grey.shade700),
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
  }

  Widget _buildListTab() {
    if (_tasks.isEmpty) {
      return Center(child: Text('Listelenecek görev yok', style: TextStyle(color: Colors.grey.shade500)));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _tasks.length,
      itemBuilder: (context, index) {
        final task = _tasks[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListTile(
            leading: const Icon(Icons.location_on, color: Color(0xFF3498DB)),
            title: Text(task['title'] ?? ''),
            subtitle: Text('${task['reward'] ?? 0} TL   ${(task['distance'] ?? 0).toString()} km uzaklıkta'),
            onTap: () {},
          ),
        );
      },
    );
  }
} 