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
- Generate two accounts from the [JS Hooks Faucet](https://jshooks.xahau-test.net/) and add them to the `.env` file.

### 1. Install Hook on Issuer Account

`yarn deploy` will configure the issuer acount and deploy the hook on it.

![Install Hook on Issuer Account](assets/hook.001.jpeg)

### 2. Configure Hook

`yarn update-key ED01FA53FA5A7E77798F882ECE20B1ABC00BB358A9E55A202D0D0676BD0CE37A63` will configure the hook to store and use the passed public key to verify the signatures on `TrustSet` transactions.

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
Signature: 121675A5CD47AE0DE8357CE0EFDF71E21FB1A92E34D981FE225E0884C2C9D5BA13A11EF86CD91B92EEE62E74DF02B752E1C4DA833E6144F95D843148B2D1520D
Public Key: ED01FA53FA5A7E77798F882ECE20B1ABC00BB358A9E55A202D0D0676BD0CE37A63
Message: 4B59435F415050524F5645447C72503374334A53747157505964384838385766425968337638347171597A62485136
```

After generating the signature, the trustline can be set like this:

`yarn trust-set 121675A5CD47AE0DE8357CE0EFDF71E21FB1A92E34D981FE225E0884C2C9D5BA13A11EF86CD91B92EEE62E74DF02B752E1C4DA833E6144F95D843148B2D1520D`

![Set Trustline from User to Issuer](assets/hook.004.jpeg)

### 4. Auto approval

The hook will be triggered and a `TrustSet` transaction from the issuer to the user will be emitted.
![Configure Hook](assets/hook.005.jpeg)