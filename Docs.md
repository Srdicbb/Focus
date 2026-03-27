PWA Deployment 

//Ovo dodaje alat za deploy na GitHub Pages.
npm install -g angular-cli-ghpages

//Angular standardno pravi statički build u dist/ folder:
ng build --configuration production --base-href "https://Srdicbb.github.io/Focus/"
ng build --configuration production --base-href "/Focus/"

//Zatim deploy:
npx ngh --dir=dist/Focus/browser --no-silent

//Ovo će push-ovati build na granu gh-pages i aplikacija će biti dostupna na:
https://Srdicbb.github.io/Focus/



// PWA

// Podrska za PWA
ng add @angular/pwa

// build za GithubPages
ng build --configuration production --base-href "/Focus/"

// Deploy 
npx ngh --dir=dist/Focus/browser