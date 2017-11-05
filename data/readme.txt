There are two data files to be used for this assignment.

1. online-shoppers-by-age-group.csv
This csv file contains information regarding the percentage of Singapore online shoppers by age group over the years 2007 to 2014.
The first row contains the keys associated to each column for values in subsequent rows.

For example, in the following csv snippet:

year,less than 7,8 to 14 years,15 to 24 years
2014,2,6,55

The above shows that in the year 2014,
2% of people less than 7 years old are online shoppers,
6% of people in between 8 to 14 years old are online shoppers,
and 55% of people in between 15 to 24 years old are online shoppers.


2. git-commit-frequency.json
This json file is structured like an array of 52 JSON corresponding to 52 weeks. Each of the 52 JSON has an array of days (which logs the frequency of git commits for each day from Monday to Sunday), the total git commits for the week and the week id. 

For example, in the following JSON:

{ 
  "days": [0,0,0,0,0,1,0],
  "total": 1,
  "week": 1457827200
}

In the week with week id - 1457827200, there is a total of 1 git commit and the commit is done on Saturday, as seen in the array of days.

Hopefully this readme provides some insight for you. Email the tutor if you have any queries.
