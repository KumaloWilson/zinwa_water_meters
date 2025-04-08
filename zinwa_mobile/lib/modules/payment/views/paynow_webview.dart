import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:get/get.dart';
import '../../../models/token_model.dart';
import '../../../routes/app_routes.dart';
import '../../../theme/app_colors.dart';
import '../../../utils/logs.dart';
import '../controllers/payment_controller.dart';

class PaymentWebViewScreen extends StatefulWidget {
  final TokenPurchaseResponse purchaseResponse;

  const PaymentWebViewScreen({super.key, required this.purchaseResponse});

  @override
  State<PaymentWebViewScreen> createState() => _PaymentWebViewScreenState();
}

class _PaymentWebViewScreenState extends State<PaymentWebViewScreen> {
  InAppWebViewController? _controller;
  bool _isLoading = true;
  double _loadingProgress = 0.0;
  String currentUrl = '';
  final PaymentController _paymentController = Get.find<PaymentController>();

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
    DevLogs.logInfo('WebView initialized with URL: ${widget.purchaseResponse.redirectUrl}');
  }

  @override
  void dispose() {
    _controller = null;
    super.dispose();
  }

  void _handlePaymentCompletion(String url) {
    if (url.contains("payment/return") ||
        url.contains("payment/success") ||
        url.contains("payment/callback")) {
      try {
        // Extract any relevant info from the URL if needed
        DevLogs.logInfo("Payment process completed in WebView: $url");
        Get.offNamed(
          AppRoutes.PAYMENT_SUCCESS,
          arguments: widget.purchaseResponse
        );
      } catch (e) {
        DevLogs.logError("Error processing payment completion: $e");
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // Show confirmation dialog before allowing user to go back
        if (_paymentController.isPolling.value) {
          final bool? shouldPop = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Cancel Payment?'),
              content: const Text('Your payment is still being processed. Are you sure you want to go back?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('NO'),
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('YES'),
                ),
              ],
            ),
          );
          return shouldPop ?? false;
        }

        // Handle normal back button press
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
            onPressed: () async {
              if (_paymentController.isPolling.value) {
                final bool? shouldClose = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Cancel Payment?'),
                    content: const Text('Your payment is still being processed. Are you sure you want to close this page?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(false),
                        child: const Text('NO'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(true),
                        child: const Text('YES'),
                      ),
                    ],
                  ),
                );
                if (shouldClose == true) {
                  Navigator.of(context).pop();
                }
              } else {
                Navigator.of(context).pop();
              }
            },
          ),
        ),
        body: SafeArea(
          child: Stack(
            children: [
              InAppWebView(
                key: const ValueKey('payment_webview'),
                initialUrlRequest: URLRequest(
                  url: WebUri.uri(Uri.parse(widget.purchaseResponse.redirectUrl)),
                ),
                initialSettings: _settings,
                onWebViewCreated: (controller) {
                  _controller = controller;
                  controller.addJavaScriptHandler(
                    handlerName: 'paymentCallback',
                    callback: (args) {
                      // Handle JS callbacks if your payment gateway sends them
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
                    _handlePaymentCompletion(url.toString());
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

                  // Handle payment completion URLs
                  if (url.contains("payment/return") ||
                      url.contains("payment/success") ||
                      url.contains("payment/callback")) {
                    _handlePaymentCompletion(url);
                  }

                  // Example: handle external links
                  if (url.startsWith('https://external') ||
                      url.startsWith('tel:') ||
                      url.startsWith('mailto:')) {
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
              // Show polling indicator if payment is being verified
              Obx(() => _paymentController.isPolling.value
                  ? Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  color: AppColors.primary.withOpacity(0.9),
                  child: Row(
                    children: [
                      const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Verifying payment status...',
                          style: TextStyle(color: Colors.white, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                ),
              )
                  : const SizedBox.shrink()),
            ],
          ),
        ),
      ),
    );
  }
}