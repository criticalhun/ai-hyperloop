import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app/features/chat/presentation/chat_screen.dart';
import 'package:app/features/generator/presentation/generator_screen.dart';
import 'package:app/main.dart';

void main() {
  group('Send Button Color Tests', () {
    testWidgets('Chat screen send button should be blue', (WidgetTester tester) async {
      // Build our app and trigger a frame.
      await tester.pumpWidget(const ProviderScope(child: MaterialApp(home: ChatScreen())));

      // Find the send button
      final sendButtonFinder = find.byIcon(Icons.send);
      expect(sendButtonFinder, findsOneWidget);

      // Get the IconButton widget
      final iconButton = tester.widget<IconButton>(find.byType(IconButton).last);
      
      // Verify that the button color is blue
      expect(iconButton.color, equals(Colors.blue));
    });

    testWidgets('Generator screen send button should be blue', (WidgetTester tester) async {
      // Build the generator screen
      await tester.pumpWidget(const ProviderScope(child: MaterialApp(home: GeneratorScreen())));

      // Find the send button
      final sendButtonFinder = find.byIcon(Icons.send);
      expect(sendButtonFinder, findsOneWidget);

      // Get the IconButton widget
      final iconButton = tester.widget<IconButton>(sendButtonFinder);
      
      // Verify that the button color is blue
      expect(iconButton.color, equals(Colors.blue));
    });
  });
}