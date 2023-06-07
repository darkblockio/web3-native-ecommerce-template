import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { useSDK, useAddress } from "@thirdweb-dev/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import TwitterButton from "../components/TwitterButton";
import MetaTags from '../components/MetaTags';


// Define configuration settings
const CONFIG = {
  contractAddress: "0xB1103E8513C2aA6d20764073E8ed83c42b0d233D",
  tokenId: "0",
  platform: "Polygon",
  nftMintingSite: "https://withpaper.com/checkout/c67df9d8-71cd-4879-9fd6-77b53fd61acc",
};

// Define all the messages to be displayed
const MESSAGES = {
  purchaseSuccessful: "Your purchase was successful!",
  accessNow: "Get access to the email list",
  purchaseFailed: "Your purchase failed!",
  tryAgain: "Please try again",
  connectWallet: "Connect to view the list",
  notHoldingNFT: "The connected wallet does not hold the NFT",
  purchaseOrLogin: "Click the button below to purchase or login with the correct wallet",
  purchaseNFT: "Purchase NFT",
  loading: "checking ownership...",
};



export default function Home() {
  const textRef = useRef();
  const sdk = useSDK();
  const walletAddress = useAddress();
  const [signedMessage, setSignedMessage] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [ownershipState, setOwnershipState] = useState(null);  // Initialize state
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false); // add loading state between signing and verifying so the 
  const epoch = "1685457506385"
  const router = useRouter();
  const successful = router.query.successful;
  const [tweetText, setTweetText] = useState(null);

  const [toastVisible, setToastVisible] = useState(false);

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000); // hide the toast after 2 seconds
  };

  const copyToClipboard = (e) => {
    navigator.clipboard.writeText(e.target.innerText);
    showToast();
  };



  useEffect(() => {
    if (!router.isReady) return;  // If router is not ready, skip the effect
    const successful = router.query.successful;
    if (successful) {
      // console.log(MESSAGES.purchaseSuccessful);
    } else {
      // console.log(MESSAGES.purchaseFailed);
    }
  }, [router.isReady, router.query]);

  const [endpoint, setEndpoint] = useState(null);

  useEffect(() => {
    if (!signedMessage) return;
    // console.log(signedMessage);
    if (walletAddress && signedMessage && ownershipState) {
      // wait one second to allow the iframe to load
      setShowIframe(true);
    }
  }, [signedMessage]);

  const messageSigning = async () => {
    let sToken = epoch + walletAddress.toLowerCase();
    let message = `You are unlocking content via the Darkblock Protocol.\n\nPlease sign to authenticate.\n\nThis request will not trigger a blockchain transaction or cost any fee.\n\nAuthentication Token: ${sToken}`
    // console.log(message);
    var data = await sdk.wallet.sign(message);
    // console.log(data);
    setSignedMessage(data);
  };

  useEffect(() => {
    // console.log(tweetText);
  }, [tweetText]);

  useEffect(() => {
    if (walletAddress) {
      setTweetText(`Fundraising is hard! Here is a list of over 6000 web3 investors (with emails!) to make your lives easier: https://web3investors.xyz/ Only 50 MATIC (<$50), but if you tweet @darkblockio about it they will refund your money! Refund me:  ${walletAddress}`);
      // console.log("Wallet connected: " + walletAddress);
    }
    if (walletAddress && !signedMessage) {

      setEndpoint(`https://api.darkblock.io/v1/nft/owner?platform=${CONFIG.platform}&contract_address=${CONFIG.contractAddress}&token_id=${CONFIG.tokenId}&owner=${walletAddress}`)

    }
  }, [walletAddress]);

  useEffect(() => {
    if (!endpoint) return;
    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        let all_owners = data.all_owners;
        let isOwner = false;
        for (let i = 0; i < all_owners.length; i++) {
          if (all_owners[i].toLowerCase() === walletAddress.toLowerCase()) {
            // setOwnerConfirmed(true);
            messageSigning();
            isOwner = true;
            break;
          }
        }
        setOwnershipState(isOwner);
      });
  }, [endpoint]);

  useEffect(() => {
    if (walletAddress) {
      setStarted(true);
    }
    if (!walletAddress && started) {
      setLoading(true);
      // console.log("Wallet disconnected");
      //wait one second to allow the iframe to load
      router.reload();
    }
  }, [walletAddress]);

  const iframeSrc = `https://staging.darkblock.io/platform/matic/embed/nft/${CONFIG.contractAddress}/${CONFIG.tokenId}/${epoch}_${signedMessage}/${walletAddress}`;

  return (
    <>
      <MetaTags
              title="" 
              description="" 
              image="" 
              url=""
      
      >
      </MetaTags>
    <div className={styles.container}>
      <main className={styles.main}>
        {loading && (
          <>
            <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
          </>
        )}
        {(!walletAddress && !loading) && (
          <>
            {successful === 'true' ? (
              <>
                <h1>{MESSAGES.purchaseSuccessful}</h1>
                <h3>{MESSAGES.accessNow}</h3>
                <ConnectWallet
                  theme="light"
                  btnTitle="Access Now"
                  style={{ marginTop: "25px" }}
                />
              </>
            ) : successful === 'false' ? (
              <>
                <h1>{MESSAGES.purchaseFailed}</h1>
                <h3>{MESSAGES.tryAgain}</h3>
                <button
                  className={styles.retryButton} // Adjust styling as needed
                  onClick={() => router.push(CONFIG.nftMintingSite)}
                >
                  Retry Purchase
                </button>
              </>
            ) : (
              <>
                <h1>{MESSAGES.connectWallet}</h1>
                <ConnectWallet
                  theme="light"
                  btnTitle="Connect Now"
                  style={{ marginTop: "25px" }}
                />
              </>
            )}
          </>
        )}

        {walletAddress && (ownershipState === true) && !signedMessage && (
          <>
            <ConnectWallet
              theme="light"
              btnTitle="Sign Now"
              style={{ marginTop: "25px" }}
            />
            <h1>Please sign to authenticate</h1>
          </>
        )}

        {walletAddress && (
          <>
            {ownershipState === false ? (
              <>
                <ConnectWallet
                  theme="light"
                  btnTitle="Sign Now"
                  style={{ marginTop: "25px" }}
                />

                <h1>{MESSAGES.notHoldingNFT}</h1>
                <h3>{MESSAGES.purchaseOrLogin}</h3>
                <button
                  className={styles.retryButton}
                  onClick={() => router.push(CONFIG.nftMintingSite)}
                >
                  {MESSAGES.purchaseNFT}
                </button>
              </>
            ) : showIframe && (
              <>
                <ConnectWallet theme="light" btnTitle="Access Now" />
                <h1>The Ultimate Web3 Investor Email List</h1>
                <p>To download the list, click on the 3 dots icon on the item and select download.</p>
                <p></p>
                <iframe
                  src={iframeSrc}
                  width="800px"
                  height="600px"
                  frameBorder="0"
                  allowFullScreen={true}
                  style={{ marginTop: "50px" }}
                />

                <div>
                  <h1>Get a full refund if you do all of the following:</h1>

                  <ol>
                    <li><a href="https://twitter.com/darkblockio">Follow us on twitter</a></li>
                    <li>Post a tweet from your own account about the list that links to Web3investors.xyz and tags Darkblock:<br></br> <TwitterButton tweetText={tweetText} /> </li>
                    <li><a href="http://discord.darkblock.io">Join the Darkblock Discord </a></li>
                    <li>Let us know in Discord that you have done all of this!</li>
                    <li>profit!</li>
                  </ol>
                </div>


                {/* <h3>Tell them how you found the list</h3> */}

                <h3>Some investors are curious about how you found them.</h3>

                 <p>Feel free to add this text to let them know!</p>

                <div className={styles.card}>

                  <p onClick={copyToClipboard}>

                    PS if you’re wondering how we got your email, we minted an NFT that included a web3 investor list as an attached encrypted asset via Darkblock. Here’s the site: Web3investors.xyz.
                    <br />
                    <br />
                    I hope you don’t mind getting this cold email, we are all just trying to build out this web3 space together!
                  </p>
                </div>
                {toastVisible && <div className={styles.toast}>Copied to clipboard!</div>}



              </>
            )}
          </>
        )}
      </main>
    </div>
    </>
  );

}
