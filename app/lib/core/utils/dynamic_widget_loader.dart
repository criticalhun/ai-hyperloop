// lib/core/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

// GeneratorResponse osztály definíciója
class GeneratorResponse {
  final String generatedCode;
  final String analysisResult;
  
  GeneratorResponse({
    required this.generatedCode, 
    required this.analysisResult
  });
}

class ApiService {
  final String _baseUrl = 'http://localhost:3000/api';

  // Üzenet küldése az AI asszisztensnek
  Future<String> sendMessage(String message) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/ask'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'query': message}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['response'] ?? 'Nincs válasz a szervertől.';
      } else {
        return 'Hiba: ${response.statusCode}';
      }
    } catch (e) {
      return 'Kapcsolódási hiba: $e';
    }
  }

  // Kódgenerálás és tesztelés metódus
  Future<GeneratorResponse> generateAndTestCode(String prompt) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/generate-and-test'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'prompt': prompt}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return GeneratorResponse(
          generatedCode: data['generatedCode'] ?? '// Nem generálódott kód.',
          analysisResult: data['analysisResult'] ?? 'Elemzés sikertelen.',
        );
      } else {
        return GeneratorResponse(
          generatedCode: '// Hiba', 
          analysisResult: 'Szerver hiba: ${response.statusCode}'
        );
      }
    } catch (e) {
      return GeneratorResponse(
        generatedCode: '// Hiba', 
        analysisResult: 'Kapcsolódási hiba: $e'
      );
    }
  }
}
