# PlacePro

PlacePro is a placement officer dashboard for campus recruitment. It includes student records, drive eligibility, interview schedules, offers, placement analytics, and a student placement CSV export.

## Run locally

```sh
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. The site uses plain HTML, CSS, and JavaScript. It starts with fictional demo records and stores edits in the current browser. The placement trend shows a fixed illustrative sample. The other metrics and reports reflect the current local records.

Drive eligibility uses the selected department and minimum CGPA. Accepted offers count toward the placement rate. Currency amounts are in Indian rupees.
