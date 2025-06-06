# CS180_Group_Project

![TypeScript](https://img.shields.io/badge/typescript-%23407ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E)

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Node.js

Our app runs on Node.js Version 20.10.0 and higher. Please ensure you have Node.js installed via the [official website](https://nodejs.org/en).

## Commands

### Dependencies

```bash
# Move to frontend directory
cd frontend

# Install dependencies
npm i

# Add dependency
npm i <dependency>

# Remove dependency
npm un <dependency>
```

### Workflow

```bash
# How to pull from github and push your work for review: 
#Always pull from dev branch first: 
git pull origin dev

# Make sure you are in the dev branch before creating and going to your own branch: 
git checkout -b yourGithubName/issueName

# Start coding
#Run Prettier to format your code 
npm run format

# Stage your changes 
git add . 

# Commit your changes 
git commit -m "short message"

# Push your changes 
git push origin <yourBranch>

# Check github repo for your pushed changes and make Pull Request (PR)
```

### Installing Expo

```bash
# Move to frontend directory
cd frontend

# Our app uses Expo which is a React Native Framework
npm install -g expo-cli

# Verify the installation
expo --version
```

### Running the App Locally

```bash
# Move to frontend directory
cd frontend

# Download the Expo Go app and create an account
npx expo start

# Clears the Metro bundler's cache (refresh and restart)
npx expo start --clear
```

### Formatting Code via Prettier

```bash
# Move to frontend directory
cd frontend

# Rewrite code recursively with proper formatting
npm run format
```

