/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState, useCallback, useRef} from 'react';
import {MDXProvider} from '@mdx-js/react';
import classnames from 'classnames';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import renderRoutes from '@docusaurus/renderRoutes';
import Layout from '@theme/Layout';
import DocSidebar from '@theme/DocSidebar';
import MDXComponents from '@theme/MDXComponents';
import NotFound from '@theme/NotFound';
import {matchPath} from '@docusaurus/router';

import styles from './styles.module.css';

function matchingRouteExist(routes, pathname) {
  return routes.some(route => matchPath(pathname, route));
}

function DocPage(props) {
  const {route, docsMetadata, location} = props;
  const {permalinkToSidebar, docsSidebars, version} = docsMetadata;
  const sidebar = permalinkToSidebar[location.pathname.replace(/\/$/, '')];
  const {siteConfig: {themeConfig = {}} = {}} = useDocusaurusContext();
  const {sidebarCollapsible = true} = themeConfig;
  const [collapsedDocSidebar, setCollapsedDocSidebar] = useState(false);

  const toggleDocSidebar = useCallback(() => {
    setCollapsedDocSidebar(!collapsedDocSidebar);
  });
  const docSidebarRef = useRef();

  // useEffect(() => {
  //   const docSidebar = docSidebarRef.current;

  //   const enableHoverEffect

  //   docSidebar.addEventListener('transitionend', enableHoverEffect);
  // });

  if (!matchingRouteExist(route.routes, location.pathname)) {
    return <NotFound {...props} />;
  }

  return (
    <Layout version={version}>
      <div className={styles.docPage}>
        {sidebar && (
          <div
            ref={docSidebarRef}
            className={classnames(styles.docSidebarContainer, {
              [styles.docSidebarContainerCollapsed]: collapsedDocSidebar,
            })}
            onClick={toggleDocSidebar}>
            <DocSidebar
              docsSidebars={docsSidebars}
              location={location}
              sidebar={sidebar}
              sidebarCollapsible={sidebarCollapsible}
              onToggle={toggleDocSidebar}
            />
          </div>
        )}
        <main className={styles.docMainContainer}>
          <MDXProvider components={MDXComponents}>
            {renderRoutes(route.routes)}
          </MDXProvider>
        </main>
      </div>
    </Layout>
  );
}

export default DocPage;
