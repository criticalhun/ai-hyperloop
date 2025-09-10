// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String _baseUrl = 'http://localhost:3000/api';
  Future<String> sendMessage(String message) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/ask'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'query': message}),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body)['response'] ?? 'No response.';
      }
      return 'Error: ${response.statusCode}';
    } catch (e) {
      return 'Error: Could not connect to the backend.';
    }
  }
}
