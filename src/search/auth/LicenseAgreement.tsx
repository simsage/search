import React from 'react';

import './LicenseAgreement.css';
import { go_home } from "../../reducers/searchSlice";
import { AppDispatch } from '../../store';
import { useDispatch as useReduxDispatch } from "react-redux";

// Use AppDispatch type for dispatch
const useAppDispatch = () => useReduxDispatch<AppDispatch>();

export function LicenseAgreement(): JSX.Element {
    const dispatch = useAppDispatch();

    function on_go_home(e: React.MouseEvent<HTMLButtonElement>): void {
        const customerLink = window.ENV.customer_website;
        // hide search results
        if (customerLink && customerLink !== '') {
            e.preventDefault();
            e.stopPropagation();
            window.open(customerLink, 'blank');
        } else {
            dispatch(go_home());
        }
    }

    return (
        <div>

            <nav className="navbar navbar-expand-lg navbar-light fixed-top">
                <div className="container">
                    <button className="navbar-brand" onClick={(event) => on_go_home(event)}>SimSage Search</button>
                    <div className="collapse navbar-collapse">
                    </div>
                </div>
            </nav>

            <br style={{ clear: 'both' }} />
            <div className="content">

                <h1>SIMSAGE™ TERMS OF USE</h1>
                <br/>
                Welcome to SimSage™, an innovative, semantic, software-based Artificial Intelligence service that assists organisations to automate their web-page interactions with Customers. SimSage™'s capabilities include automating Customer enquiries requests for information, particularly by supplementing, or replacing Frequently Asked Questions (FAQs).<br/>
                <br/>
                <br/>
                These Terms of Use, as amended from time to time (Terms) explain the terms on which SimSage™  Limited (NZCN 6798094) of 86 Tinakori Road, Wellington, New Zealand (SimSage™) provides customers with access to certain services through the www.simsage.nz website (Website). Please read them carefully.<br/>
                <br/>
                By registering to use the Services and clicking "I accept", You acknowledge that You have read and understood these Terms and if You are acting on behalf of any person for whom You are using the Services, that You have full authority to act and are deemed to have agreed to these Terms on behalf of that person for whom you use the Services.<br/>
                <br/>
                SimSage™ reserves the right to change these Terms at any time, effective on posting the modified terms on the Website, and SimSage™ will make every effort to communicate these changes to You via email or notification via the Website. It is likely the Terms will change over time, particularly as the Services evolve to reflect our development of the Services and user feedback. It is Your obligation to ensure that You have read, understood and agree to the most recent Terms available on the Website.<br/>
                <br/>
                <h2>1. The Website and the Services</h2>
                <br/>
                1.1	The Website is owned and managed by SimSage Limited (NZCN 6798094) of 86 Tinakori Road, Wellington, New Zealand.<br/>
                <br/>
                1.2 In consideration of You paying the Fees, SimSage™ shall provide You with the services described on the Website (Services). To avoid doubt, SimSage™'s obligations are limited to providing the Services and do not in any way include acting on Your behalf. Nothing in these Terms is intended to, or shall be deemed to, establish any partnership or joint venture between You and SimSage™, appoint either party as the agent of the other, nor authorise either party to make or enter into any commitments for, or on behalf of, the other party.<br/>
                <br/>
                1.3 SimSage™ may from time to time add, modify, suspend or cease (temporarily or permanently) providing any element of the Services upon notice to You, such notice to be effective on the earlier of SimSage™ posting on the Website or via email to You.<br/>
                <br/>
                1.4 If there is unplanned service downtime in respect of the Services or the Website, SimSage™ shall use its reasonable endeavours (but has no obligation) to notify You in advance provided that SimSage™ is able to do so and such notice will be effective on the earlier of SimSage™ posting on the Website or notifying You via email.<br/>
                <br/>
                1.5 Access to the Website and the Services may be granted to You, at SimSage™'s discretion and on terms and for a period agreed in writing (and if no time period is specified, for one month only), on a trial or 'free' basis (Trial). You acknowledge and agree that these Terms shall apply to the Trial, and in addition, during the Trial:<br/>
                1.5.1 access to the Services will be provided to You at no cost;<br/>
                1.5.2 such access is solely for the purpose of offering You a preview demonstration of the functionality and features of the Services;<br/>
                1.5.3 the functionality of the Services may be limited or restricted; and<br/>
                1.5.4 SimSage™ may withdraw or suspend Your access to the Services at any time, and at the end of the one month Trial period (or such other Trial period agreed in writing), Your continued access to the Website and/or Services will be subject to payment of Fees or charges in accordance with clause 4.<br/>
                <br/>
                <h2>2 Register to use the Services</h2>
                <br/>
                2.1	To use the Services You must first register with SimSage™ by completing the online registration form on the Website.<br/>
                <br/>
                2.2 SimSage™ will send You a confirmation email (Confirmation Email) once it has accepted and confirmed Your registration. Your contract to use the Services on these Terms (Contract) starts on the date of the Confirmation Email.<br/>
                <br/>
                2.3 SimSage™ reserves the right to conduct verification and security procedures in respect of all information provided by You to SimSage™. If SimSage™ believes the information provided by You to register and use any of the Services breaches (or may breach) any of these Terms, SimSage™ at its sole discretion may take any action it deems appropriate, including without limitation, to terminate Your Contract (with no return of any Fees already paid).<br/>
                <br/>
                2.4 These Terms apply to any Authorised Personnel who You authorize to access and use the Website and the Services through Your account. You acknowledge and agree:<br/>
                2.4.1 all Authorised Personnel must use the corporate  email address allocated to them by You when creating an Authorised Personnel profile;<br/>
                2.4.2 SimSage™ may allocate Your "Admin" or "Member" accounts with varying levels of access, and You shall comply (and ensure each Authorised Personnel complies) with any SimSage™ directions for setting up and using such accounts; and<br/>
                2.4.3 You are directly liable to SimSage™ at all times for the acts or omissions of Your Authorised Personnel.<br/>
                <br/>
                2.5 You shall keep, and ensure Your Authorised Personnel keep, Your and Your Authorised Personnel's usernames and passwords (Logins) safe and secure to ensure they are not used without Your permission. You must immediately notify SimSage™ if You believe there has been unauthorised use or access to Your Logins and/or Your profile on the Website. You shall be solely responsible and liable for any breach of these Terms arising out of, or resulting from, using Your Logins to access the Services and/or the Website (whether such use is authorised by You or not).<br/>
                <br/>
                2.6 SimSage™ may, at any time on notice, require You to sign any further documents to confirm Your acceptance of, or give full effect to, these Terms.<br/>
                <br/>
                <h2>3 Your obligations - general</h2>
                <br/>
                3.1	The obligations in this clause 3 apply to all users of SimSage™, the Services and/or the Website. Additional obligations   are set out below.<br/>
                <br/>
                3.2 You shall at all times use the Services and the Website in accordance with these Terms.<br/>
                <br/>
                3.3 You shall ensure Your use of the Services and/or the Website, including submitting any information, data, images, videos, audio, files, links to external websites, communication between Authorised Personnel, and all other material of any format (Submissions), in each case:<br/>
                3.3.1 complies with all applicable laws;<br/>
                3.3.2 does not infringe any intellectual property or other proprietary rights of any third party;<br/>
                3.3.3 does not, or could not reasonably be deemed to:<br/>
                <ul>
                    <li>be offensive, illegal, inappropriate or in any way promote racism, bigotry, hatred or physical harm of any kind against any group or individual;</li>
                    <li>harass or advocate harassment of another person;</li>
                    <li>display pornographic or sexually explicit material;</li>
                    <li>promote conduct that is abusive, threatening, obscene, or defamatory;</li>
                    <li>promote any illegal activities, or provide instructional information about illegal activities, including violating someone else's privacy; or</li>
                    <li>provide or create computer viruses, other malware or denial of service attacks;</li>
                    <li>promote or contain information that is inaccurate, false or misleading;</li>
                    <li>engage in promoting contests, sweepstakes and pyramid schemes;</li>
                    <li>exploit people in a sexual or violent manner;</li>
                    <li>invade or violate any third party's right to privacy; and</li>
                    <li>transmit "junk mail", or "chain letters", or unsolicited mass mailing, messaging or "spamming";</li>
                </ul>
                and You hereby indemnify SimSage™ for all losses, liabilities, costs and expenses (including legal costs) suffered or incurred by SimSage™ (and/or its parent company) which arise directly or indirectly from Your breach of this clause 3.2.<br/>
                <br/>
                3.4 SimSage™ does not vet, verify the accuracy, correctness and completeness, edit or modify any Submission or any other information, data and materials created, used and/or published by You or on Your behalf on Your Website to determine whether they may result in any liability to any third party. You warrant that You have the right to use all such information and material.<br/>
                <br/>
                3.5 Notwithstanding clause 3.3, SimSage™ reserves the right to refuse to publish any Submissions, or to remove or edit a Submission (in whole or in part and at any time), if SimSage™ believes Your use of the Services and/or the Website breaches these Terms.<br/>
                <br/>
                3.6 You shall not at any time:<br/>
                3.6.1 use the Services and/or the Website to impersonate (or in a way that impersonates) another User or person; and<br/>
                3.6.2 use the information made available to You through Your use of the Services and/or the Website for any purpose other than for procuring benefit out of the Services and/or the Website; and<br/>
                3.6.3 do anything whatsoever which (or which is likely to) impair, interfere with, damage, or cause harm or distress to any person using the Services and/or the Website or in respect of the network.<br/>
                <br/>
                3.7 SimSage™ takes breaches of this clause 3 very seriously and reserves the right to take any action that SimSage™ deems necessary, including suspending or terminating Your use of the Services and/or access to the Website. SimSage™ may also commence legal proceedings if there is illegal use of the Services and/or the Website, or disclose information to any third party who is claiming that any material posted or uploaded by You to our Website violates their intellectual property or other proprietary rights or their right to privacy. You shall promptly notify SimSage™ if You are aware of any breach (or any suspected breach) of this clause 3 by Your Authorised Personnel.<br/>
                <br/>
                <h2>4 Fees</h2>
                <br/>
                4.1 The fees to access the Services are set out on the Website (Fees). Except where You are using any Services that are specifically noted on the Website as "Free", or participating in a Trial in accordance with clause 1.5, You may only access the Services by paying the Fees noted on the Website..<br/>
                <br/>
                4.2 Unless stated otherwise on the Website or agreed by SimSage™ in writing, the Fees shall be payable by You, in the manner as set out on the Website.<br/>
                <br/>
                4.3 All Fees are inclusive of GST and all other taxes or duties, and are non-refundable for any reason whatsoever.<br/>
                <br/>
                4.4 The Fees or any rate of charge may be increased by SimSage™ upon not less than 30 days prior written notice to You, which notice may be provided through the Website.<br/>
                <br/>
                <h2>5 Warranties</h2>
                <br/>
                5.1 You: You warrant that (a) You have the right and capacity to enter into, and be bound by, these Terms;  (b) You shall comply with all applicable laws relating to Your use of the Services and/or the Website; and (c)  You shall comply with SimSage™'s requirements and reasonable directions relating to the Services and Website as notified by SimSage™ from time to time.<br/>
                <br/>
                5.2 SimSage™: The provision of, access to, and use of, the Services and the Website is on an "as is " basis and at Your own risk. SimSage™ gives no warranty about the Services and/or the Website, and in particular, SimSage™ does not warrant that:<br/>
                5.2.1 the Services will meet Your requirements or that it will be suitable for any particular purpose. It is Your sole responsibility to determine that the Services meet Your needs and/or the needs of Your business and are suitable for the purposes for which they are used; or<br/>
                5.2.2 the use of the Services will be uninterrupted or error free. Among other things, the operation and availability of the systems used for accessing the Services, including public telephone services, computer networks and the Internet, can be unpredictable and may from time to time interfere with or prevent access to the Services. SimSage™ is not in any way responsible for any such interference or prevention of Your access or use of the Services.
                To avoid doubt, all implied conditions or warranties are excluded to the maximum extent permitted by law, including (without limitation) warranties of merchantability, non-infringement of intellectual property, accuracy, completeness, fitness for a particular purpose, and any warranties arising by statute or otherwise in law or from course of dealing, course of performance, or use of trade.<br/>
                <br/>
                5.3 Third party websites: SimSage™ may display or provide links or other interaction with third party websites and third party advertising banners on the Website (Third Party Websites). In particular, the Services may also provide You with the opportunity to connect and publish Your Information through Third Party Websites and other third party services such as social and business networking sites. Use of any such Third Party Websites and services shall be at Your sole risk and subject to the terms and conditions of the Third Party Website provider.<br/>
                <br/>
                <h2>6 Limitation of liability</h2>
                <br/>
                6.1 To the maximum extent permitted by law, SimSage™ excludes all liability and responsibility to You (or any other person) in contract, tort (including negligence), or otherwise, for any loss (including loss of information, Data, profits and savings) or damage resulting, directly or indirectly, from any use of, or reliance on, the Services and/or Website.<br/>
                <br/>
                6.2 If You suffer loss or damage as a result of SimSage™'s negligence or failure to comply with these Terms, any claim by You against SimSage™ arising from SimSage™'s negligence or failure will be limited in respect of any one incident, or series of connected incidents, to the Fees paid by You in the previous month. You are directly liable to SimSage™ at all times for the acts or omissions of Your Authorised Personnel, in accordance with clause 2.4.<br/>
                <br/>
                6.3 If You are not satisfied with the Services, Your sole and exclusive remedy is to terminate these Terms in accordance with clause 7.<br/>
                <br/>
                <h2>7 Termination</h2>
                <br/>
                7.1 Trial policy: If SimSage™ agrees in writing, in accordance with clause 1.5, to provide You with a trial usage period when You first sign up for access to the Services, You can evaluate the Services under the specified trial usage conditions, with no obligation to continue to use the Services. If You choose to continue using the Services thereafter, any payment applicable in accordance with clause 7 will be billed to You from the day You first added Your billing details into the Services.<br/>
                <br/>
                7.2 Prepaid Subscriptions: SimSage™ will not provide any refund for any remaining prepaid period for a prepaid Fee subscription.<br/>
                <br/>
                7.3 No-fault termination: These Terms will continue for the period covered by the Fee paid or payable under clause 7.1. At the end of each billing period, these Terms will automatically continue for another period of the same duration as that period, provided You continue to pay the prescribed Fee when due, unless either party terminates these Terms by giving at least 30 days' notice to the other party before the end of the relevant payment period. If You terminate these Terms, You shall be liable to pay all relevant Fees on a pro-rata basis for each day of the then current period up to and including the day of termination of these Terms.<br/>
                <br/>
                7.4 Breach: If You:<br/>
                7.4.1 breach any of these Terms (including by non-payment of any Fees) and (i) if the breach is capable of being remedied, do not remedy the breach within 14 days after receiving notice of the breach; and (ii) if the breach is not capable of being remedied (which includes any payment of Fees that are more than 30 days overdue); or<br/>
                7.4.2 You or Your business become insolvent or Your business goes into liquidation or has a receiver or manager appointed of any of its assets or if You become insolvent, or make any arrangement with Your creditors, or become subject to any similar insolvency event in any jurisdiction,
                SimSage™ may, at its sole discretion:<br/>
                7.4.3 Terminate this Agreement and Your use of the Services;<br/>
                7.4.4 Suspend for any definite or indefinite period of time, Your use of the Services;<br/>
                7.4.5 Suspend or terminate access to all or any Data; and/or<br/>
                7.4.6 Take any of these actions in relation to any other person/s whom You have authorised to have access to Your information or Data.<br/>
                <br/>
                7.5 Accrued Rights: Termination of these Terms is without prejudice to any rights or obligations of the parties which have accrued up to and including the date of termination, and shall not affect the provisions of these Terms which expressly, or by their nature, are intended to continue, including this clause 7 (Termination), and clauses 5 (Warranties), 6 (Limitation of Liability), 8 (Intellectual Property Rights). On termination of this Agreement You will:<br/>
                7.5.1 remain liable for any accrued Fees and amounts which become due for payment before or after termination; and<br/>
                7.5.2 immediately cease to use the Services.<br/>
                <br/>
                <h2>8 Intellectual property rights</h2>
                <br/>
                8.1 Title to, and all intellectual property rights in, the Services, the Website, including all software forming part of the Website (Software), and any documentation relating to the Services, is and remains the property of SimSage™ (or its licensors). Nothing in these Terms will transfer from SimSage™ to You any right, title or interest in the Services, the Website, the Software and associated documentation, all of which remain exclusively with SimSage™ (or its licensors). All rights in and to the Software and the Website not expressly granted to You are reserved by SimSage™ (and its licensors).<br/>
                <br/>
                8.2 You may print off one copy and may download extracts of any pages from the Website solely for use by You; and You may draw the attention of other Users to Submissions or materials posted on the Website. You must not use any part of the Submissions of other Users and all materials on the Website for any purpose other than accessing the Website or obtaining a benefit from the Services in accordance with these Terms.<br/>
                <br/>
                8.3 You shall not, and shall procure that Authorised Personnel shall not modify, translate, create or attempt to create derivative copies of or copy the Software and/or the Website in whole or in part; reverse engineer, decompile, disassemble or otherwise reduce the object code of the Software and/or the Website to source code form; distribute, sub-licence, assign, share, timeshare, sell, rent, lease, transmit, grant a security interest in or otherwise transfer the Software, the Website and/or Your right to use the Software or the Website.<br/>
                <br/>
                8.4 You:<br/>
                8.4.1 Warrant that You own or have the right or licence to use the intellectual property rights in the Your Information, all information and materials provided by You to SimSage™; and<br/>
                8.4.2 indemnify SimSage™ against all losses, liabilities, costs and expenses (including but not limited to legal costs) arising from or incurred by reason of any infringement of any intellectual property right by the use or possession of Your Information, and all other information and material provided by You to SimSage™.<br/>
                <br/>
                <h2>9 Data protection & privacy policy</h2>
                <br/>
                9.1 You and SimSage™ shall comply with the Privacy Act 1993 (and all other successor legislation and regulations) in performing their obligations under these Terms.<br/>
                <br/>
                9.2 SimSage™ processes personal information (as defined in the Privacy Act 1993) which it collects in the course of providing the Services in accordance with its Privacy Policy which is accessible on the Website. You should read that policy at www.SimSage.nz/privacy/. You will be deemed to have accepted that policy when You accept these Terms.<br/>
                <br/>
                9.3 For personal information which is processed by SimSage™ on Your behalf as part of the Services, SimSage™ will act strictly in accordance with Your instructions by following the processing and security obligations contained in these Terms. You confirm that You are solely responsible for ensuring that any such processing and security obligations comply with all applicable privacy and data protection laws. You hereby indemnify SimSage™ against all losses, liabilities, costs and expenses (including but not limited to legal costs) arising from or incurred by reason of Your failure to comply with this clause 9.<br/>
                <br/>
                <h2>10 General</h2>
                <br/>
                10.1 No Assignment: You may not assign or transfer any rights to any other person without SimSage™'s prior written consent. SimSage™ may assign or transfer its rights and/or obligations under these Terms without requiring Your consent.<br/>
                <br/>
                10.2 Waiver: If either party waives any breach of these Terms, this will not constitute a waiver of any other breach. No waiver will be effective unless made in writing.<br/>
                <br/>
                10.3 Delays: Neither party will be liable for any delay or failure in performing its obligations under these Terms if the delay or failure is due to any cause outside its reasonable control. This clause does not apply to any obligation to pay money.<br/>
                <br/>
                10.4 Severability: If any provision of these Terms is invalid, unenforceable or conflicts with applicable law, that provision is replaced with a provision which, as far as possible, accomplishes the original purpose of that provision. The remainder of these Terms will be binding on the parties.<br/>
                <br/>
                10.5 Notices: Unless specified otherwise in these Terms, any notice given under these Terms by one party to the other must be in writing by email and will be deemed to have been given on transmission. Notices to SimSage™ must be sent to support@simsage.nz  or to any other email address notified by email to You by SimSage™. Notices to You will be sent to the email address which You provided when registering for the Services. SimSage™ reserves the right to change these Terms at any time, effective on posting the modified terms on the Website, and SimSage™ will make every effort to communicate these changes to You via email or notification via the Website.<br/>
                <br/>
                10.6 Rights of Third Parties: A person who is not a party to these Terms has no right to benefit under or to enforce any term of these Terms.<br/>
                <br/>
                10.7 Acknowledgement: You acknowledge that in entering into these Terms, You have not relied on any representations, undertakings or promises given by or implied from anything said or written (whether on the Website, the internet or in negotiation between the parties) except as expressly set out in these Terms.<br/>
                <br/>
                10.8 Entire agreement: These Terms, together with our Privacy Policy and the terms of any other notices or instructions given to You under these Terms, supersede and extinguish all prior agreements, representations (whether oral or written), and understandings and constitute the entire agreement between You and SimSage™ relating to the Services, the Website and the other matters addressed in these Terms.<br/>
                <br/>
                10.9 Governing law and jurisdiction: These Terms are governed by, and shall be construed in accordance with, New Zealand law and shall be subject to the exclusive jurisdiction of the New Zealand courts.<br/>
                <br/>
                <br/>
            </div>

            <div className="bottomLink">
                <button onClick={(event) => on_go_home(event)}>close</button>
            </div>

        </div>
    )
}
