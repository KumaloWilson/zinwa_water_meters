import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

import '../../../theme/app_colors.dart';
import '../../../utils/logs.dart';

class PaymentWebViewScreen extends StatefulWidget {
  final String redirectUrl;

  const PaymentWebViewScreen({super.key, required this.redirectUrl});

  @override
  State<PaymentWebViewScreen> createState() => _PaymentWebViewScreenState();
}

class _PaymentWebViewScreenState extends State<PaymentWebViewScreen> {
  InAppWebViewController? _controller;
  bool _isLoading = true;
  final bool _showProceedButton = false;
  double _loadingProgress = 0.0;
  String currentUrl = '';


  final InAppWebViewSettings _settings = InAppWebViewSettings(
    useShouldOverrideUrlLoading: true,
    mediaPlaybackRequiresUserGesture: false,
    cacheEnabled: true,
    javaScriptEnabled: true,
    // Android-specific settings
    useHybridComposition: true,
    domStorageEnabled: true,
    // iOS-specific settings
    allowsInlineMediaPlayback: true,
  );

  @override
  void initState() {
    super.initState();
    // Log the URL for debugging
    DevLogs.logInfo('WebView initialized with URL: ${widget.redirectUrl}');
  }


  @override
  void dispose() {
    _controller = null;
    super.dispose();
  }

  // void _handlePaymentCompletion(String url) {
  //   if (url.contains("payment/return")) {
  //     try {
  //       final uri = Uri.parse(url);
  //       final purchaseId = int.parse(uri.pathSegments.last);
  //       DevLogs.logInfo("Payment completed with purchaseID: $purchaseId");
  //
  //
  //     } catch (e) {
  //       DevLogs.logError("Error processing payment completion: $e");
  //     }
  //   }
  // }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // Handle back button press
        if (_controller != null && await _controller!.canGoBack()) {
          _controller!.goBack();
          return false;
        }
        return true;
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Payment', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18)),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.of(context).pop(),
          ),
          actions: [
            if (_showProceedButton)
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop(true);
                },
                child: const Text('Proceed', style: TextStyle(color: Colors.white)),
              ),
          ],
        ),
        body: SafeArea(
          child: Stack(
            children: [
              InAppWebView(
                key: const ValueKey('payment_webview'),
                initialUrlRequest: URLRequest(
                  url: WebUri.uri(Uri.parse(widget.redirectUrl)),
                ),
                initialSettings: _settings,
                onWebViewCreated: (controller) {
                  _controller = controller;
                  controller.addJavaScriptHandler(
                    handlerName: 'paymentCallback',
                    callback: (args) {

                      return {'status': 'received'};
                    },
                  );
                },
                onLoadStart: (controller, url) {
                  if (url != null) {
                    setState(() {
                      _isLoading = true;
                      currentUrl = url.toString();
                    });
                    DevLogs.logInfo("Loading URL: ${url.toString()}");
                  }
                },
                onLoadStop: (controller, url) {
                  if (url != null) {
                    setState(() {
                      _isLoading = false;
                      currentUrl = url.toString();
                    });
                    DevLogs.logSuccess("Loaded URL: ${url.toString()}");
                    //_handlePaymentCompletion(url.toString());
                  }
                },
                onProgressChanged: (controller, progress) {
                  setState(() {
                    _loadingProgress = progress / 100;
                    _isLoading = progress < 100;
                  });
                },
                onReceivedError: (controller, request, error) {
                  DevLogs.logError("WebView Error: ${error.description}");
                  // Show error state or retry option
                },
                shouldOverrideUrlLoading: (controller, navigationAction) async {
                  // Optional: Handle specific URLs differently
                  final url = navigationAction.request.url?.toString() ?? '';

                  // Example: handle external links
                  if (url.startsWith('https://external') || url.startsWith('tel:') || url.startsWith('mailto:')) {
                    // Open in external browser or handle specially
                    // launchUrl(Uri.parse(url));
                    return NavigationActionPolicy.CANCEL;
                  }

                  return NavigationActionPolicy.ALLOW;
                },
              ),
              // Use linear progress indicator for more accurate loading display
              if (_isLoading)
                LinearProgressIndicator(
                  value: _loadingProgress > 0 ? _loadingProgress : null,
                  backgroundColor: Colors.transparent,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                ),
              // Show a centered circular indicator for initial loading
              if (_isLoading && _loadingProgress < 0.1)
                Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
