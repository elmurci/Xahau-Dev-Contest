# Authorized Trustlines Auto Approver

## Overview

This project demonstrates a mechanism to automatically approve trustlines for an asset once a user’s KYC/AML status has been verified. It leverages an issuer hook that, upon detecting a valid signature from a recognized authority, emits a `TrustSet` transaction from the issuer to the user.

## Problem

When using Authorized Trustlines, the issuing account must explicitly approve any new trustline. This requirement can undermine the utility of “cold” wallets, since they must come online to grant these approvals.

## Idea

A weak execution of the issuer hook in a post `ttTrustSettransaction` that auto-approves trustlines after verifying a signature (by an issuing entity or authority).

If this check passes, a `TrustSet` transaction from the issuer to the user would be emitted.

The issuing account needs the `asfTshCollect` flag set and the issuer hook the `hsfCollect` flag.

### Key Participants

1. Issuer

The entity that issues the asset and manages approvals. The issuer decides who can hold and transact with the asset.

2. User

An individual or entity seeking to hold the asset. Upon approval, the user gains the ability to pay, receive, and trade the asset.

3. Compliance Oracle

Also referred to as the **KYC/AML Attestation Provider**. This party verifies user identities and compliance with AML/KYC regulations. Once approved, it generates a certificate indicating the user’s compliant status, which is then used to request automatic trustline approval.

## Setup

### 0. Prerequisites

- Install dependencies: `yarn`
- Rename `.env.example` to `.env`
- Generate two accounts: from the [JS Hooks Faucet](https://jshooks.xahau-test.net/) if you are using the experimental network or by funding them if running local/standalone. After that, add them to the `.env` file.

If you are running standalone, use version `2024.7.17-jshooks+933`.

### 1. Install Hook on Issuer Account

`yarn deploy` will configure the issuer acount and deploy the hook on it.

![Install Hook on Issuer Account](assets/hook.001.jpeg)

### 2. Configure Hook

`yarn update-key ED5F3FCD7FC27ED8FAD7673B2C9C00E3D37711CBB6D9B0E4DDC0F2FFE2941E15B5` will configure the hook to store and use the passed public key to verify the signatures on `TrustSet` transactions.

The public key passed represents the third party Compliance Oracle asigning KYC/AML certificates.

![Configure Hook](assets/hook.003.jpeg)

### 3. Set Trustline from User to Issuer

`yarn trust-set {CERTIFICATE_SIGNATURE}` will issue a `TrustSet` transaction from the user to the issuer account.

The signature to be passed to the above command can be generated with `yarn certificate`.

For the sake of this PoC, the certificate will be a message with the following format (in a real world scenario this message would vary and include information like expiry date and such):

`KYC_APPROVED|${AccountId}`

Signed by a third party entity representing the KYC/AML approval for the user's address.

Example response:

```
Signature: 7189A4FD8009B30610CE7C7F81FFE21A38C36E971EE497EAFB467AC438B0D7F65126FA4C0C29E8C1CC5578BDC2F7A6A255FA2BDBB2951EBA041B746D3494BE0D
Public Key: ED5F3FCD7FC27ED8FAD7673B2C9C00E3D37711CBB6D9B0E4DDC0F2FFE2941E15B5
Message: 4B59435F415050524F5645447C725574396F3935586B59775477777147363747546532426566754151343433506541
Verification true
```

After generating the signature, the trustline can be set like this:

`yarn trust-set 121675A5CD47AE0DE8357CE0EFDF71E21FB1A92E34D981FE225E0884C2C9D5BA13A11EF86CD91B92EEE62E74DF02B752E1C4DA833E6144F95D843148B2D1520D`

![Set Trustline from User to Issuer](assets/hook.004.jpeg)

### 4. Auto approval

The hook will be triggered and, if the signature provided is valid, a `TrustSet` transaction from the issuer to the user will be emitted.
![Configure Hook](assets/hook.005.jpeg)