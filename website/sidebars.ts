import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],


  // But you can create a sidebar manually
  tutorialSidebar: [
    {
      type: 'autogenerated', dirName: 'tutorial'
    //   type: 'category', label:'Food Data to RDF', items: [
    //     {type: 'doc', id: 'tutorial/intro', label: 'Intro'},
    //     {type: 'doc', id: 'tutorial/installation', label: 'Install'},
    //     {type: 'doc', id: 'tutorial/adding-data', label: 'Add Data'},
    //     {type: 'doc', id: 'tutorial/transformation', label: 'Transform'}
    // ]
  }
    
  ],

  conceptsSidebar: [
  
    'tutorial-basics/congratulations',
    {type: 'autogenerated', dirName: './concepts'}
  ]
};

// export default {
//   tutorialSidebar: {
//     'Category A': ['doc1', 'doc2'],
//   },
//   apiSidebar: ['doc3', 'doc4'],
// };

export default sidebars;
