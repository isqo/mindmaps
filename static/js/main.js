
// Get Stripe publishable key
fetch("/config")
    .then((result) => {
        return result.json();
    })
    .then((data) => {
        // Initialize Stripe.js
        const stripe = Stripe(data.publicKey);

        $("#submitLink").click(function () {
            fetch("/create-checkout-session")
                .then((result) => {
                    return result.json();
                })
                .then((data) => {
                    // Redirect to Stripe Checkout
                    return stripe.redirectToCheckout({sessionId: data.sessionId})
                })
                .then((res) => {
                    console.log(res);
                });
        });

    });