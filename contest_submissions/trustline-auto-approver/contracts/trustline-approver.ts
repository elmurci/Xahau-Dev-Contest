import { DOESNT_EXIST, INTERNAL_ERROR, NOT_AUTHORIZED, SUCCESS } from "jshooks-api";
import { Transaction } from '@transia/xahau-models'
import { encodeString, getOtxnParam, uint8ArrayToString } from './helpers'

const Hook = (arg: number) => {
  // Get the transaction
  const txn = otxn_json() as Transaction

  trace("Trustline-Approver: Called.", 0, false);

  etxn_reserve(1);

  switch (txn.TransactionType) {
    // If the transaction is a TrustSet
    case "TrustSet":
      trace("Trustline-Approver: TrustSet.", 0, false);

      if (txn.Memos?.length === 0) {
        return rollback("Trustline-Approver: Please provide necessary information in the TrustSet Memo field.", DOESNT_EXIST);
      }

      const data = txn.Memos?.[0].Memo; // TODO: We only check the first memo, but we should check all memos

      if (state(encodeString("K")) === DOESNT_EXIST) {
        return rollback("Trustline-Approver: Please initialize the hook with the Certificate issuer Public Key.", DOESNT_EXIST);
      }

      if (data?.MemoType !== "53") {
        return rollback("Trustline-Approver: Please provide the signature in the TrustSet Memo field.", DOESNT_EXIST);
      }

      const messageToVerify = encodeString(`KYC_APPROVED|${txn.Account}`);
      const signature = data!.MemoData as string;
      const verification = util_verify(
        messageToVerify,
        signature,
        uint8ArrayToString(new Uint8Array(state(encodeString("K")) as number[])).toUpperCase()
      );

      if (verification === 1 ) {
        const prepared = prepare({
          TransactionType: "TrustSet",
          LimitAmount: {
            currency: "USD",
            issuer: txn.Account,
            value: String(Number(100_000_000)),
          },
        });

        if (typeof prepared !== "object" || prepared === null || "error" in prepared) {
          return rollback("Trustline-Approver: Failed to prepare transaction.", INTERNAL_ERROR);
        }
      
        trace("Trustline-Approver: Prepared Transaction", prepared);
        
        const emitted = emit(prepared as Transaction);
      
        trace("Trustline-Approver: Transaction Emitted", emitted);
      } else {
        return rollback("Trustline-Approver: Signature is invalid.", NOT_AUTHORIZED);
      }

      break;

    case "Invoke":
      trace("Trustline-Approver: Invoke.", 0, false);
      let newIssuerKey = getOtxnParam("K");
      if (newIssuerKey === DOESNT_EXIST) {
        return rollback(`Trustline-Approver: No issuer key found in payload.`, DOESNT_EXIST);
      }
      const setState = state_set(uint8ArrayToString(new Uint8Array(newIssuerKey as number[])), encodeString("K"));
      if (setState < 0) {
        return rollback("Trustline-Approver: Could not set state.", INTERNAL_ERROR);
      }
      break;
  }

  return accept("Trustline-Approver: Accepted", SUCCESS);
};

export { Hook };