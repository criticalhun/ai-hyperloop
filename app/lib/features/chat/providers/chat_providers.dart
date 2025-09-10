// lib/features/chat/providers/chat_providers.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/api_service.dart';
import '../data/message.dart';

// Provider az ApiService-hez
final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

// Provider a csevegés állapotához (az üzenetek listája)
final chatStateProvider = StateNotifierProvider<ChatNotifier, List<Message>>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return ChatNotifier(apiService);
});

class ChatNotifier extends StateNotifier<List<Message>> {
  ChatNotifier(this._apiService) : super([]);

  final ApiService _apiService;
  bool isLoading = false;

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty || isLoading) return;

    isLoading = true;
    state = [Message(text: text, isUser: true), ...state];

    try {
      final response = await _apiService.sendMessage(text);
      state = [Message(text: response, isUser: false), ...state];
    } catch (e) {
      state = [Message(text: 'Error: ${e.toString()}', isUser: false), ...state];
    } finally {
      isLoading = false;
    }
  }
}
