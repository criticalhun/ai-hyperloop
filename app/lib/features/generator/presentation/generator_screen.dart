// lib/features/generator/presentation/generator_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_syntax_view/flutter_syntax_view.dart';
import '../../../core/services/api_service.dart'; // Hiányzó import a GeneratorResponse-hoz
import '../providers/generator_providers.dart';

class GeneratorScreen extends ConsumerWidget {
  const GeneratorScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final textController = TextEditingController();
    final generatorState = ref.watch(generatorStateProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Kódgenerátor és Validator')),
      body: Column(
        children: [
          // Prompt beviteli terület
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: textController,
              decoration: InputDecoration(
                hintText: 'Pl: Egy kék gomb lekerekített sarkokkal...',
                labelText: 'Widget Prompt',
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: generatorState.isLoading
                      ? null
                      : () => ref.read(generatorStateProvider.notifier).generateCode(textController.text),
                ),
              ),
            ),
          ),
          
          // Eredmény terület - görgethető
          Expanded(
            child: generatorState.isLoading
              ? const Center(child: CircularProgressIndicator())
              : generatorState.response == null
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.code, size: 64, color: Colors.blueGrey),
                        const SizedBox(height: 16),
                        Text(
                          'Adj meg egy promptot Flutter kód generálásához',
                          style: theme.textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Például: "Egy piros gomb lekerekített sarkokkal és árnyékkal"',
                          style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                : _buildResultsView(context, generatorState.response!, theme),
          ),
        ],
      ),
    );
  }
  
  Widget _buildResultsView(BuildContext context, GeneratorResponse response, ThemeData theme) {
    final bool isSuccess = response.analysisResult.contains("No issues found");
    
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        // Elemzési eredmény kártya
        Card(
          color: isSuccess 
              ? Colors.green.withOpacity(0.1)
              : Colors.red.withOpacity(0.1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(
              color: isSuccess ? Colors.green : Colors.red,
              width: 1,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      isSuccess ? Icons.check_circle : Icons.error,
                      color: isSuccess ? Colors.green : Colors.red,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Elemzési eredmény:',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                SelectableText(
                  response.analysisResult,
                  style: const TextStyle(fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 16),
        
        // Generált kód szekció
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Generált kód:', style: theme.textTheme.titleMedium),
            IconButton(
              icon: const Icon(Icons.copy),
              tooltip: 'Másolás a vágólapra',
              onPressed: () {
                Clipboard.setData(ClipboardData(text: response.generatedCode));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Kód a vágólapra másolva')),
                );
              },
            ),
          ],
        ),
        
        // Kód nézet szintaxis kiemeléssel
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.blueGrey.shade200),
            borderRadius: BorderRadius.circular(8),
          ),
          height: 400, // Rögzített magasság a kód nézethez
          child: SyntaxView(
            code: response.generatedCode,
            syntax: Syntax.DART,
            syntaxTheme: SyntaxTheme.vscodeDark(),
            withLinesCount: true,
            fontSize: 14,
          ),
        ),
      ],
    );
  }
}
