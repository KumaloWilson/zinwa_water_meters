import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:zinwa_mobile_app/models/token_model.dart';
import 'package:zinwa_mobile_app/services/token_service.dart';
import '../../../routes/app_routes.dart';
import '../../../theme/app_colors.dart';

class SuccessScreen extends StatefulWidget {
  final TokenPurchaseResponse purchaseResponse;

  const SuccessScreen({super.key, required this.purchaseResponse});

  @override
  SuccessScreenState createState() => SuccessScreenState();
}

class SuccessScreenState extends State<SuccessScreen> {
  late ConfettiController _confettiController;
  TokenCompleteResponse? completeResponse;
  bool _isLoading = true;
  String? _errorMessage;
  int _retryCount = 0;
  final int _maxRetries = 3;

  Future<void> confirmPurchase(TokenPurchaseResponse response) async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final result = await TokenService().completeTokenPurchase(
          reference: response.payment.referenceNumber,
          status: 'paid',
          pollUrl: response.pollUrl
      );

      if (!mounted) return;

      setState(() {
        completeResponse = result;
        _isLoading = false;
      });

      // Play confetti animation on successful confirmation
      _confettiController.play();
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _errorMessage = "Failed to confirm purchase: ${e.toString()}";
        _isLoading = false;
      });
    }
  }

  Future<void> retryConfirmation() async {
    if (_retryCount >= _maxRetries) {
      setState(() {
        _errorMessage = "Maximum retry attempts reached. Please contact support.";
      });
      return;
    }

    setState(() {
      _retryCount++;
    });

    await confirmPurchase(widget.purchaseResponse);
  }

  @override
  void initState() {
    super.initState();

    _confettiController = ConfettiController(duration: const Duration(seconds: 3));

    // Delay to allow the widget to fully build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      confirmPurchase(widget.purchaseResponse);
    });
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      // Prevent back button during processing
      onWillPop: () async => !_isLoading,
      child: Scaffold(
        body: Stack(
          alignment: Alignment.center,
          children: [
            // Confetti animation overlay
            ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              numberOfParticles: 25,
            ),

            // Main content based on state
            Padding(
              padding: const EdgeInsets.all(20),
              child: _buildContent(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return _buildLoadingState();
    } else if (_errorMessage != null) {
      return _buildErrorState();
    } else if (completeResponse != null) {
      return _buildSuccessState();
    } else {
      // Fallback for any unexpected state
      return const Center(
        child: Text("Something went wrong. Please try again."),
      );
    }
  }

  Widget _buildLoadingState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: const [
        CircularProgressIndicator(),
        SizedBox(height: 20),
        Text(
          "Confirming your purchase...",
          style: TextStyle(fontSize: 16),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildErrorState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.error_outline,
          color: Colors.red,
          size: 70,
        ),
        const SizedBox(height: 10),
        Text(
          "Error",
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 10),
        Text(
          _errorMessage ?? "An unknown error occurred",
          style: TextStyle(color: AppColors.textSecondary),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 30),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: _retryCount < _maxRetries ? retryConfirmation : null,
              child: Text("Retry (${_maxRetries - _retryCount} attempts left)",
                  style: const TextStyle(color: Colors.white)),
            ),
            const SizedBox(width: 10),
            TextButton(
              onPressed: () {
                Get.offAllNamed(AppRoutes.HOME);
              },
              child: const Text("Return Home"),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSuccessState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.check_circle,
          color: AppColors.primary,
          size: 70,
        ),
        const SizedBox(height: 10),
        const Text(
          "Purchase Complete",
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),
        _buildTransactionDetails(),
        const SizedBox(height: 30),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 60, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Get.offAllNamed(AppRoutes.HOME);
            },
            child: const Text("Done", style: TextStyle(color: Colors.white)),
          ),
        ),
      ],
    );
  }

  Widget _buildTransactionDetails() {
    // Guard against null completeResponse
    if (completeResponse == null) {
      return const Center(
        child: Text("Transaction details not available"),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildDetailRow("Token", completeResponse!.token.tokenValue),
          _buildDetailRow("Token Amount", "${completeResponse!.token.amount}"),
          _buildDetailRow("Volume Purchased", "${completeResponse!.token.units}"),
          _buildDetailRow("Reference", widget.purchaseResponse.payment.referenceNumber),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
          Text(value, style: TextStyle(color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}