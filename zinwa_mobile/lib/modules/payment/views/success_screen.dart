import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
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
  late TokenCompleteResponse completeResponse;

  Future<void> confirmPurchase(TokenPurchaseResponse response) async{
    completeResponse = await TokenService().completeTokenPurchase(
        reference: response.payment.referenceNumber,
        status: 'paid',
        pollUrl: response.pollUrl
    );
  }

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_){
      confirmPurchase(widget.purchaseResponse);
    });

    _confettiController = ConfettiController(duration: const Duration(seconds: 3));
    _confettiController.play();
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        alignment: Alignment.center,
        children: [
          ConfettiWidget(
            confettiController: _confettiController,
            blastDirectionality: BlastDirectionality.explosive,
            numberOfParticles: 25,
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
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
                      Navigator.of(context).pushNamedAndRemoveUntil(
                        AppRoutes.HOME,
                        (route) => false,
                      );
                    },
                    child: const Text("Done", style: TextStyle(color: Colors.white)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// **Transaction Details Section**
  Widget _buildTransactionDetails() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildDetailRow("Token", completeResponse.token.tokenValue),
          _buildDetailRow("Token Amount", "${completeResponse.token.amount}"),
          _buildDetailRow("Volume Purchased", "${completeResponse.token.units}"),
        ],
      ),
    );
  }

  /// **Reusable Detail Row**
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
