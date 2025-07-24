import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';

class StoryViewer extends StatefulWidget {
  final List<Map<String, dynamic>> stories;
  final int initialIndex;

  const StoryViewer({super.key, required this.stories, this.initialIndex = 0});

  @override
  State<StoryViewer> createState() => _StoryViewerState();
}

class _StoryViewerState extends State<StoryViewer>
    with TickerProviderStateMixin {
  late PageController _pageController;
  late AnimationController _progressController;
  int _currentPageIndex = 0;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _currentPageIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
    _progressController = AnimationController(
      duration: Duration(
        seconds: widget.stories.isNotEmpty
            ? (widget.stories[_currentPageIndex]['duration'] ?? 10)
            : 10,
      ),
      vsync: this,
    );

    _startStoryProgress();
    _markCurrentStoryAsViewed();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _progressController.dispose();
    super.dispose();
  }

  void _startStoryProgress() {
    _progressController.reset();
    _progressController.forward().then((_) {
      if (!_isPressed) {
        _nextStory();
      }
    });
  }

  void _nextStory() {
    if (_currentPageIndex < widget.stories.length - 1) {
      setState(() {
        _currentPageIndex++;
      });
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      _updateStoryDuration();
      _startStoryProgress();
      _markCurrentStoryAsViewed();
    } else {
      Navigator.of(context).pop();
    }
  }

  void _previousStory() {
    if (_currentPageIndex > 0) {
      setState(() {
        _currentPageIndex--;
      });
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      _updateStoryDuration();
      _startStoryProgress();
      _markCurrentStoryAsViewed();
    } else {
      Navigator.of(context).pop();
    }
  }

  void _updateStoryDuration() {
    final duration = widget.stories[_currentPageIndex]['duration'] ?? 10;
    _progressController.duration = Duration(seconds: duration);
  }

  void _pauseStory() {
    _progressController.stop();
    setState(() {
      _isPressed = true;
    });
  }

  void _resumeStory() {
    _progressController.forward();
    setState(() {
      _isPressed = false;
    });
  }

  Future<void> _markCurrentStoryAsViewed() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    if (authService.currentUser != null) {
      final storyId = widget.stories[_currentPageIndex]['id'].toString();
      await ApiService.instance.markStoryAsViewed(
        storyId,
        authService.currentUser!.id,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.stories.isEmpty) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Text(
            'Hikaye bulunamadı',
            style: TextStyle(color: Colors.white, fontSize: 18),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTapDown: (_) => _pauseStory(),
        onTapUp: (_) => _resumeStory(),
        onTapCancel: () => _resumeStory(),
        onLongPress: _pauseStory,
        onLongPressUp: _resumeStory,
        child: Stack(
          children: [
            // Story content
            PageView.builder(
              controller: _pageController,
              itemCount: widget.stories.length,
              onPageChanged: (index) {
                setState(() {
                  _currentPageIndex = index;
                });
                _updateStoryDuration();
                _startStoryProgress();
                _markCurrentStoryAsViewed();
              },
              itemBuilder: (context, index) {
                final story = widget.stories[index];
                return _buildStoryContent(story);
              },
            ),

            // Progress indicators
            Positioned(
              top: MediaQuery.of(context).padding.top + 10,
              left: 10,
              right: 10,
              child: Row(
                children: widget.stories.asMap().entries.map((entry) {
                  return Expanded(
                    child: Container(
                      height: 3,
                      margin: const EdgeInsets.symmetric(horizontal: 1),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(1.5),
                      ),
                      child: entry.key == _currentPageIndex
                          ? AnimatedBuilder(
                              animation: _progressController,
                              builder: (context, child) {
                                return LinearProgressIndicator(
                                  value: _progressController.value,
                                  backgroundColor: Colors.transparent,
                                  valueColor:
                                      const AlwaysStoppedAnimation<Color>(
                                        Colors.white,
                                      ),
                                );
                              },
                            )
                          : Container(
                              decoration: BoxDecoration(
                                color: entry.key < _currentPageIndex
                                    ? Colors.white
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(1.5),
                              ),
                            ),
                    ),
                  );
                }).toList(),
              ),
            ),

            // Story header
            Positioned(
              top: MediaQuery.of(context).padding.top + 25,
              left: 10,
              right: 10,
              child: Row(
                children: [
                  // Story avatar
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Color(
                        int.parse(
                          widget.stories[_currentPageIndex]['backgroundColor']
                              .replaceFirst('#', '0xFF'),
                        ),
                      ),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: const Icon(
                      Icons.star,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Story title and time
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.stories[_currentPageIndex]['title'],
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          _getTimeAgo(
                            widget.stories[_currentPageIndex]['createdAt'],
                          ),
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Close button
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(
                      Icons.close,
                      color: Colors.white,
                      size: 28,
                    ),
                  ),
                ],
              ),
            ),

            // Navigation areas
            Row(
              children: [
                // Left tap area (previous story)
                Expanded(
                  flex: 1,
                  child: GestureDetector(
                    onTap: _previousStory,
                    child: Container(
                      color: Colors.transparent,
                      height: double.infinity,
                    ),
                  ),
                ),
                // Right tap area (next story)
                Expanded(
                  flex: 1,
                  child: GestureDetector(
                    onTap: _nextStory,
                    child: Container(
                      color: Colors.transparent,
                      height: double.infinity,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStoryContent(Map<String, dynamic> story) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(
              int.parse(story['backgroundColor'].replaceFirst('#', '0xFF')),
            ),
            Color(
              int.parse(story['backgroundColor'].replaceFirst('#', '0xFF')),
            ).withOpacity(0.8),
          ],
        ),
      ),
      child: Stack(
        children: [
          // Background image/video
          if (story['mediaUrl'] != null)
            Center(
              child: Image.network(
                story['mediaUrl'],
                width: double.infinity,
                height: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: Color(
                      int.parse(
                        story['backgroundColor'].replaceFirst('#', '0xFF'),
                      ),
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.image_not_supported,
                        color: Colors.white,
                        size: 50,
                      ),
                    ),
                  );
                },
              ),
            ),

          // Text overlay
          if (story['text'] != null)
            Positioned(
              bottom: 100,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Text(
                  story['text'],
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _getTimeAgo(String createdAt) {
    try {
      final dateTime = DateTime.parse(createdAt);
      final now = DateTime.now();
      final difference = now.difference(dateTime);

      if (difference.inDays > 0) {
        return '${difference.inDays} gün önce';
      } else if (difference.inHours > 0) {
        return '${difference.inHours} saat önce';
      } else if (difference.inMinutes > 0) {
        return '${difference.inMinutes} dakika önce';
      } else {
        return 'Az önce';
      }
    } catch (e) {
      return 'Az önce';
    }
  }
}
