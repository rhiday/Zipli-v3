# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - combobox [ref=e6] [cursor=pointer]:
      - generic: Suomi
      - img [ref=e7] [cursor=pointer]
    - generic [ref=e9]:
      - heading "Tervetuloa takaisin" [level=1] [ref=e10]
      - paragraph [ref=e11]: Kirjaudu tilillesi
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: Sähköpostiosoite
        - textbox "Sähköpostiosoite" [ref=e15]: donor@zipli.test
      - generic [ref=e16]:
        - generic [ref=e17]: Salasana
        - textbox "Salasana" [ref=e18]: password
      - generic [ref=e20]:
        - checkbox "Muista minut" [ref=e21]
        - generic [ref=e22] [cursor=pointer]: Muista minut
      - button "Kirjaudutaan sisään..." [disabled] [ref=e24]
      - link "Unohditko salasanan?" [ref=e26] [cursor=pointer]:
        - /url: /auth/forgot-password
  - button "Show dev switcher" [ref=e27] [cursor=pointer]:
    - generic [ref=e28] [cursor=pointer]: ▲
  - button "Open Next.js Dev Tools" [ref=e34] [cursor=pointer]:
    - img [ref=e35] [cursor=pointer]
  - alert [ref=e38]
```