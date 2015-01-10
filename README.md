# Discourse SSO Mozilla
*Discourse SSO server for Mozilla*

**Mentor**: [Leo McArdle](https://mozillians.org/u/leo/)

**Good first bugs**: https://github.com/Mozilla-cIT/discourse-sso-mozilla/labels/good%20first%20bug

**Description**: This SSO server allows one to log into Discourse with Mozilla Persona.

# Installation

Follow the instructions on Discourse Meta: https://meta.discourse.org/t/official-single-sign-on-for-discourse/13045

Clone the repository:

```
git clone https://github.com/Mozilla-cIT/discourse-sso-mozilla.git
cd discourse-sso-mozilla/
```

Install the dependencies:

```
npm install
```

Finally, pass the secret to the SSO server, and start it with:

```
SECRET=gaben npm start
```

# Licence

[MPL 2.0](https://www.mozilla.org/MPL/2.0/)
