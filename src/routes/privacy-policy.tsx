import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      { title: 'Privacy Policy | Plantora' },
      {
        name: 'description',
        content:
          'Read Plantora’s Privacy Policy to understand how we collect, use, and protect your personal information.',
      },
      { property: 'og:title', content: 'Privacy Policy | Plantora' },
      {
        property: 'og:description',
        content:
          'Read Plantora’s Privacy Policy to understand how we collect, use, and protect your personal information.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
});

function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-2.5 py-10 font-sans text-[#1D4D44] md:py-16 lg:px-5">
      <article className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-serif text-3xl font-medium md:text-4xl">
          Privacy Policy
        </h1>

        <section className="mb-8">
          <p className="text-sm leading-relaxed md:text-base">
            At Plantora, accessible from www.Plantora.co, one of our main
            priorities is the privacy of our visitors. This Privacy Policy
            document contains the types of information that is collected and
            recorded by Plantora and how we use it.
          </p>
          <p className="mt-4 text-sm leading-relaxed md:text-base">
            If you have additional questions or require more information about
            our Privacy Policy, do not hesitate to{' '}
            <a
              href="/contact"
              className="underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              contact us
            </a>
            .
          </p>
          <p className="mt-4 text-sm leading-relaxed md:text-base">
            This Privacy Policy applies only to our online activities and is
            valid for visitors to our website with regards to the information
            that they shared and/or collect in Plantora. This policy is not
            applicable to any information collected offline or via channels other
            than this website.
          </p>
        </section>

        <PolicySection title="Consent">
          <p>
            By using our website, you hereby consent to our Privacy Policy and
            agree to its terms.
          </p>
        </PolicySection>

        <PolicySection title="Information we collect">
          <p>
            The personal information that you are asked to provide, and the
            reasons why you are asked to provide it, will be made clear to you at
            the point we ask you to provide your personal information.
          </p>
          <p>
            If you contact us directly, we may receive additional information
            about you such as your name, email address, phone number, the
            contents of the message and/or attachments you may send us, and any
            other information you may choose to provide.
          </p>
          <p>
            When you register for an Account, we may ask for your contact
            information, including items such as name, company name, address,
            email address, and telephone number.
          </p>
        </PolicySection>

        <PolicySection title="How we use your information">
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed md:text-base">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>
              Communicate with you, either directly or through one of our
              partners, including for customer service, to provide you with
              updates and other information relating to the website, and for
              marketing and promotional purposes
            </li>
            <li>Send you emails</li>
            <li>Find and prevent fraud</li>
          </ul>
        </PolicySection>

        <PolicySection title="Log Files">
          <p>
            Plantora follows a standard procedure of using log files. These
            files log visitors when they visit websites. All hosting companies
            do this and a part of hosting services&apos; analytics. The
            information collected by log files includes internet protocol (IP)
            addresses, browser type, Internet Service Provider (ISP), date and
            time stamp, referring/exit pages, and possibly the number of clicks.
            These are not linked to any information that is personally
            identifiable. The purpose of the information is for analyzing
            trends, administering the site, tracking users&apos; movement on the
            website, and gathering demographic information.
          </p>
        </PolicySection>

        <PolicySection title="Cookies and Web Beacons">
          <p>
            Like any other website, Plantora uses &apos;cookies&apos;. These
            cookies are used to store information including visitors&apos;
            preferences, and the pages on the website that the visitor accessed or
            visited. The information is used to optimize the users&apos;
            experience by customizing our web page content based on
            visitors&apos; browser type and/or other information.
          </p>
        </PolicySection>

        <PolicySection title="Advertising Partners Privacy Policies">
          <p>
            You may consult this list to find the Privacy Policy for each of
            the advertising partners of Plantora.
          </p>
          <p>
            Third-party ad servers or ad networks use technologies like cookies,
            JavaScript, or Web Beacons that are used in their respective
            advertisements and links that appear on Plantora, which are sent
            directly to users&apos; browser. They automatically receive your IP
            address when this occurs. These technologies are used to measure the
            effectiveness of their advertising campaigns and/or to personalize
            the advertising content that you see on websites that you visit.
          </p>
          <p>
            Note that Plantora has no access to or control over these cookies
            that are used by third-party advertisers.
          </p>
        </PolicySection>

        <PolicySection title="Third Party Privacy Policies">
          <p>
            Plantora&apos;s Privacy Policy does not apply to other advertisers
            or websites. Thus, we are advising you to consult the respective
            Privacy Policies of these third-party ad servers for more detailed
            information. It may include their practices and instructions about
            how to opt out of certain options.
          </p>
          <p>
            You can choose to disable cookies through your individual browser
            options. To know more detailed information about cookie management
            with specific web browsers, it can be found on the browsers&apos;
            respective websites.
          </p>
        </PolicySection>

        <PolicySection title="CCPA Privacy Rights (Do Not Sell My Personal Information)">
          <p>
            Under the CCPA, among other rights, California consumers have the
            right to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed md:text-base">
            <li>
              Request that a business that collects a consumer&apos;s personal
              data disclose the categories and specific pieces of personal
              data that a business has collected about consumers.
            </li>
            <li>
              Request that a business deletes any personal data about the
              consumer that a business has collected.
            </li>
            <li>
              Request that a business that sells a consumer&apos;s personal data,
              not sell the consumer&apos;s personal data.
            </li>
          </ul>
          <p>
            If you make a request, we have one month to respond to you. If you
            would like to exercise any of these rights, please{' '}
            <a
              href="/contact"
              className="underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              contact us
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection title="GDPR Data Protection Rights">
          <p>
            We would like to make sure you are fully aware of all of your data
            protection rights. Every user is entitled to the following:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed md:text-base">
            <li>
              <strong>The right to access</strong> – You have the right to
              request copies of your personal data. We may charge you a small
              fee for this service.
            </li>
            <li>
              <strong>The right to rectification</strong> – You have the right
              to request that we correct any information you believe is
              inaccurate. You also have the right to request that we complete
              the information you believe is incomplete.
            </li>
            <li>
              <strong>The right to erasure</strong> – You have the right to
              request that we erase your personal data, under certain
              conditions.
            </li>
            <li>
              <strong>The right to restrict processing</strong> – You have the
              right to request that we restrict the processing of your personal
              data, under certain conditions.
            </li>
            <li>
              <strong>The right to object to processing</strong> – You have the
              right to object to our processing of your personal data, under
              certain conditions.
            </li>
            <li>
              <strong>The right to data portability</strong> – You have the
              right to request that we transfer the data that we have collected
              to another organization, or directly to you, under certain
              conditions.
            </li>
          </ul>
          <p>
            If you make a request, we have one month to respond to you. If you
            would like to exercise any of these rights, please{' '}
            <a
              href="/contact"
              className="underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              contact us
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection title="Children&apos;s Information">
          <p>
            Another part of our priority is adding protection for children while
            using the internet. We encourage parents and guardians to observe,
            participate in, and/or monitor and guide their online activity.
          </p>
          <p>
            Plantora does not knowingly collect any Personal Identifiable
            Information from children under the age of 13. If you think that
            your child provided this kind of information on our website, we
            strongly encourage you to{' '}
            <a
              href="/contact"
              className="underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              contact us
            </a>{' '}
            immediately and we will do our best efforts to promptly remove such
            information from our records.
          </p>
        </PolicySection>
      </article>
    </main>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-serif text-xl font-medium md:text-2xl">
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed md:text-base">
        {children}
      </div>
    </section>
  );
}
