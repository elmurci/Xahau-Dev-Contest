
import {
    sign,
    verify
} from "@transia/ripple-keypairs";

function stringToHex(message: string): string {
    return Buffer.from(message, 'utf8').toString('hex').toUpperCase();
}

// Dummy Keys for demo purposes: DO NOT USE IN PRODUCTION
const keypair = {
    privateKey: "ED042075786C493EBAA937FA4C61A4E66F436B2C643CA55322255FE7F6C6F29C03",
    publicKey: "ED5F3FCD7FC27ED8FAD7673B2C9C00E3D37711CBB6D9B0E4DDC0F2FFE2941E15B5"
};

export async function main(): Promise<void> {

    const address = process.argv[2];

    if (!address) {
        console.error("Please provide an address as an argument.");
        process.exit(1);
    };

    const message = `KYC_APPROVED|${address}`;
    const messageHex = stringToHex(message);
    const signature = sign(messageHex, keypair.privateKey);
    console.log("Signature:", signature);
    console.log("Public Key:", keypair.publicKey);
    console.log("Message:", messageHex);
    console.log("Verification", verify(messageHex, signature, keypair.publicKey));
}

main();
