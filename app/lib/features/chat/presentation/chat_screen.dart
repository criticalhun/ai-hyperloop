// lib/features/chat/presentation/chat_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/chat_providers.dart';
import '../data/message.dart';
import '../../generator/presentation/generator_screen.dart'; // Importáljuk az új képernyőt

class ChatScreen extends ConsumerWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messages = ref.watch(chatStateProvider);
    final chatNotifier = ref.read(chatStateProvider.notifier);
    final textController = TextEditingController();

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Hyperloop Chat'),
        actions: [
          // ÚJ GOMB a generátor képernyő megnyitásához
          IconButton(
            icon: const Icon(Icons.auto_awesome), // "Varázspálca" ikon
            tooltip: 'Open Code Generator',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const GeneratorScreen()),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          Flexible(
            child: ListView.builder(
              padding: const EdgeInsets.all(8.0),
              reverse: true,
              itemCount: messages.length,
              itemBuilder: (_, index) => MessageBubble(message: messages[index]),
            ),
          ),
          if (chatNotifier.isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8.0),
              child: LinearProgressIndicator(),
            ),
          const Divider(height: 1.0),
          MessageComposer(
            onSubmitted: (text) => chatNotifier.sendMessage(text),
            isLoading: chatNotifier.isLoading,
            textController: textController,
          ),
        ],
      ),
    );
  }
}

class MessageBubble extends StatelessWidget {
  const MessageBubble({super.key, required this.message});
  final Message message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 10.0),
      child: Row(
        mainAxisAlignment: message.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          Flexible(
            child: Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              color: message.isUser ? theme.primaryColor : theme.cardColor,
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: SelectableText(message.text, style: const TextStyle(color: Colors.white, fontSize: 16)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class MessageComposer extends StatelessWidget {
  const MessageComposer({
    super.key,
    required this.onSubmitted,
    required this.isLoading,
    required this.textController,
  });

  final Function(String) onSubmitted;
  final bool isLoading;
  final TextEditingController textController;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(8.0),
      child: Row(
        children: [
          Flexible(
            child: TextField(
              controller: textController,
              onSubmitted: isLoading ? null : (text) {
                onSubmitted(text);
                textController.clear();
              },
              decoration: const InputDecoration.collapsed(hintText: 'Send a message...'),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.send),
            onPressed: isLoading ? null : () {
              onSubmitted(textController.text);
              textController.clear();
            },
            color: Theme.of(context).primaryColor,
          ),
        ],
      ),
    );
  }
}
