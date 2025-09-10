// lib/features/generator/providers/generator_providers.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/api_service.dart';

// Provider a service-hez
final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

// Provider a generátor állapotához
final generatorStateProvider = StateNotifierProvider<GeneratorNotifier, GeneratorState>((ref) {
  return GeneratorNotifier(ref.watch(apiServiceProvider));
});

// A generátor állapotát leíró osztály
class GeneratorState {
  final bool isLoading;
  final GeneratorResponse? response;
  
  GeneratorState({this.isLoading = false, this.response});
}

class GeneratorNotifier extends StateNotifier<GeneratorState> {
  GeneratorNotifier(this._apiService) : super(GeneratorState());
  
  final ApiService _apiService;
  
  Future<void> generateCode(String prompt) async {
    state = GeneratorState(isLoading: true);
    
    final response = await _apiService.generateAndTestCode(prompt);
    
    state = GeneratorState(isLoading: false, response: response);
  }
}
