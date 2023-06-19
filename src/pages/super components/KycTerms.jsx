import React from 'react'

const KycTerms = ({closeFunction}) => {

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
                        <div className="sub-title">Data Privacy Policy</div>
                        <div className="span">
                            This Data Privacy Policy ("Policy") sets forth the terms and conditions governing the collection,
                            use, protection, and disclosure of personal information by OffrCloud.io LLC ("Company"). This
                            Policy outlines the procedures and practices adopted by the Company to ensure compliance
                            with applicable data protection laws and regulations.
                            :
                        </div>
                        <div className="item">
                            <span>(1)</span><span>  Collection and Use of Personal Information</span> <br />
                            The Company collects personal information solely for the purposes of complying with Know
                            Your Customer (KYC) and Anti-Money Laundering (AML) rules, as required by applicable laws
                            and regulations. Personal information collected may include, but is not limited to, the following:
                            full name, residential address, date of birth, government-issued identification numbers, contact
                            information, and financial information.
                        </div>
                        <div className="item">
                            <span>(2)</span><span> Consent to Collect and Use Personal Information</span> <br />
                            By providing personal information to the Company, individuals expressly consent to the
                            collection, use, storage, and processing of their personal information for the purposes stated in
                            this Policy. The Company shall not collect or process personal information without the
                            individual's consent or unless required by law.
                        </div>
                        <div className="item">
                            <span>(3)</span><span> Protection of Personal Information</span> <br />
                            The Company shall implement and maintain reasonable technical, organizational, and
                            administrative measures to protect personal information against unauthorized access,
                            disclosure, alteration, or destruction. These measures include, but are not limited to, encryption,
                            access controls, and regular security assessments.

                        </div>
                        <div className="item">
                            <span>(4)</span><span> Disclosure of Personal Information</span> <br />
                            The Company shall not disclose personal information to any third party, except as required by
                            applicable laws, regulations, or legal processes. In such cases, the Company shall ensure that
                            any third party with whom personal information is shared provides an equivalent level of
                            protection as set forth in this Policy.
                        </div>
                        <div className="item">
                            <span>(5)</span><span> Retention of Personal Information</span> <br />
                            Personal information shall be retained for as long as necessary to fulfill the purposes for which it
                            was collected, unless a longer retention period is required by law. The Company shall take
                            reasonable steps to ensure the accuracy and currency of the personal information it retains.
                        </div>
                        <div className="item">
                            <span>(6)</span><span> Rights of Individuals</span> <br />
                            Individuals have the right to access, correct, or request the deletion of their personal
                            information, subject to any applicable legal restrictions. Requests to exercise these rights should
                            be directed to the Company's designated privacy contact, whose details are provided at the end
                            of this Policy.
                        </div>
                        <div className="item">
                            <span>(7)</span><span> Updates to this Policy</span> <br />
                            The Company reserves the right to amend or modify this Policy at any time. Updated versions of
                            the Policy shall be posted on the Company's website and will be effective from the date of
                            posting.
                        </div>
                        <div className="item">
                            <span>(8)</span><span> Governing Law and Jurisdiction</span> <br />
                            This Policy shall be governed by and construed in accordance with the laws of Georgia of the
                            United States of America. Any disputes arising out of or in connection with this Policy shall be
                            subject to the exclusive jurisdiction of the courts of Georgia of the United States of America.
                        </div>
                        <span>
                            If you have any questions or concerns regarding this Policy or the Company's data privacy
                            practices, please contact our designated privacy contact:
                        </span>
                        <span>
                            OffrCloud.io LLC
                            <br />
                            1755 E Park Place Blvd, Stone Mountain, GA 30087
                        </span>
                        <span>
                            By providing your personal information to the Company, you acknowledge that you have read
                            and understood this Policy, and you consent to the collection, use, and disclosure of your
                            personal information as described herein.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KycTerms