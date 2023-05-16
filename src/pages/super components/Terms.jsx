import React from 'react'

const Terms = ({closeFunction}) => {

    const closeTerms = () =>{
        closeFunction(false);
    }

    return (
        <div className="cover">
            <div className="div terms">
                <div className="close" onClick={closeTerms}>x</div>
                <div className="title">Know-Your Customer (KYC) Terms & Condition</div>
                <div className='main'>
                    <div className="p">
                        <div className="sub-title">Legal Disclaimer</div>
                        <div className="span">
                            Offrcloud LLC will not be responsible for any losses, damages or claims arising from events
                            falling within the scope of the following five categories:
                        </div>
                        <div className="item">
                            <span>(1)</span> Mistakes made by the user of any OffrToken-related software or service, e.g., forgotten
                            passwords, payments sent to wrong wallet addresses, and accidental deletion of wallets.
                        </div>
                        <div className="item">
                            <span>(2)</span> Software problems of the Website and/or any OffrToken-related software or service,
                            e.g., corrupted wallet file, incorrectly constructed transactions, unsafe cryptographic
                            libraries, malware affecting the Website and/or any OffrToken-related software or service.
                        </div>
                        <div className="item">
                            <span>(3)</span> Technical failures in the hardware of the user of any OffrToken-related software or
                            service, e.g., data loss due to a faulty or damaged storage device.
                        </div>
                        <div className="item">
                            <span>(4)</span> Security problems experienced by the user of any OffrToken-related software or
                            service, e.g., unauthorized access to users' wallets and/or accounts.
                        </div>
                        <div className="item">
                            <span>(5)</span> Actions or inactions of third parties and/or events experienced by third parties, e.g.,
                            bankruptcy of service providers, information security attacks on service providers, and
                            fraud conducted by third parties.
                        </div>
                        <span>
                            The investment in Offrtoken can lead to loss of money over short or even long periods. The
                            investors in OffrToken should expect prices to have large range fluctuations. The information
                            published on the website cannot guarantee that the investors in OffrToken would not lose
                            money. The users of the website are solely responsible to determine what, if any, taxes apply
                            to their Offrtoken transactions. The owners of, or contributors to, the website are not
                            responsible for determining the taxes that apply to OffrToken transactions. The website does
                            not store, send or receive OffrToken. This is because OffrToken exists only by virtue of the
                            ownership record maintained in the Ethereum network. Any transfer of title in OffrToken
                            occurs within a decentralized Ethereum network, and not on the website. The Website is
                            provided on an "as is'' basis without any warranties of any kind regarding the website and/or
                            any content, data, materials and/or services provided on the website. Unless otherwise
                            required by law, in no event shall the owners of, or contributors to, the website be liable for
                            any damages of any kind, including, but not limited to, loss of use, loss of profits, or loss of
                            data arising out of or in any way connected with the use of the website. The user of the
                            website agrees to arbitrate any dispute arising from or in connection with the website or this
                            disclaimer, except for disputes related to copyrights, logos, trademarks, trade names, trade
                            secrets or patents
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Terms