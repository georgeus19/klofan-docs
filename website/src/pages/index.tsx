import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Workflow from '@site/static/img/workflow.drawio.svg'

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>

        <div className='container'>
          <div className={clsx('row', styles.bts)}>
              <Link
              className={clsx(styles.buttons, styles.live, "button button--secondary button--lg")}
                to="/editor/index.html">
                Live Instance
              </Link>
            <Link
              className={clsx(styles.buttons, styles.tutorial, "button button--secondary button--lg")}
                to="/docs/tutorial/intro">
                Tutorial
              </Link>

          </div>

        </div>
      </div>
    </header>
  );
}
//⏱️

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
    title='Home'
    description="System for interactive transformation of structured data to RDF">
      <HomepageHeader />
      
      <main>
          <Workflow id='workflow' className={ clsx(styles.featureSvg, styles.workflow, styles.featureSvg)} role='img'></Workflow>
        {/* <HomepageFeatures /> */}
      </main>
    </Layout>
  );
}
