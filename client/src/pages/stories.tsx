import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StoryModal from "@/components/modals/story-modal";
import { Camera, Plus, Eye, Trash2, Play, Clock, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Stories() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: storiesData, isLoading } = useQuery({
    queryKey: ["/api/admin/stories"],
  });

  const stories = storiesData?.stories || [];

  const deleteStoryMutation = useMutation({
    mutationFn: (storyId: number) => apiRequest("DELETE", `/api/admin/stories/${storyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stories"] });
    }
  });

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} gün önce`;
    } else if (diffHours > 0) {
      return `${diffHours} saat önce`;
    } else {
      return 'Az önce';
    }
  };

  if (isLoading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Camera className="text-white w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Hikaye Yönetimi</CardTitle>
                <p className="text-sm text-slate-500">Instagram benzeri hikayeler oluşturun ve yönetin</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Hikaye Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stories && stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stories.map((story: any) => (
                <div key={story.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200">
                  {/* Story Preview */}
                  <div 
                    className="aspect-[9/16] relative overflow-hidden cursor-pointer"
                    style={{ 
                      background: story.backgroundColor || '#4ECDC4',
                      backgroundImage: story.mediaUrl ? `url(${story.mediaUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    onClick={() => {
                      setSelectedStory(story);
                      setShowEditModal(true);
                    }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Story header */}
                    <div className="absolute top-3 left-3 right-3 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                      <div className="ml-2 flex-1">
                        <p className="text-white text-sm font-semibold truncate">{story.title}</p>
                        <p className="text-white/80 text-xs">{getTimeAgo(story.createdAt)}</p>
                      </div>
                    </div>

                    {/* Story content */}
                    {story.text && (
                      <div className="absolute bottom-12 left-3 right-3">
                        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3">
                          <p className="text-white text-sm font-medium line-clamp-3">
                            {story.text}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Duration indicator */}
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                        <Clock className="w-3 h-3 text-white mr-1" />
                        <span className="text-white text-xs">{story.duration || 10}s</span>
                      </div>
                    </div>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Story Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge 
                        variant={story.isActive ? "default" : "secondary"}
                        className={story.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600"}
                      >
                        {story.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                      <div className="flex items-center text-sm text-slate-500">
                        <Users className="w-4 h-4 mr-1" />
                        {story.viewCount || 0}
                    </div>
                    </div>

                    <h3 className="font-semibold text-slate-900 mb-2 truncate">
                      {story.title}
                    </h3>

                    <div className="flex items-center justify-between">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedStory(story);
                            setShowEditModal(true);
                          }}
                        className="flex-1 mr-2"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                        Düzenle
                        </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Bu hikayeyi silmek istediğinizden emin misiniz?')) {
                            deleteStoryMutation.mutate(story.id);
                          }
                        }}
                        disabled={deleteStoryMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Henüz hikaye bulunmuyor</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                İlk hikayenizi oluşturun ve kullanıcılarınızla Instagram benzeri içerikler paylaşmaya başlayın
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                İlk Hikayeyi Oluştur
              </Button>
            </div>
          )}

          {/* Stats Cards */}
          {stories.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Toplam Hikaye</p>
                      <p className="text-2xl font-bold text-blue-700">{stories.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Aktif Hikaye</p>
                      <p className="text-2xl font-bold text-green-700">
                        {stories.filter((s: any) => s.isActive).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900">Toplam İzlenme</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {stories.reduce((total: number, story: any) => total + (story.viewCount || 0), 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateModal && (
        <StoryModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && selectedStory && (
        <StoryModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStory(null);
          }}
          story={selectedStory}
        />
      )}
    </div>
  );
}
