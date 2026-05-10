---
title: "From 'just buy a computer' to serverless"
description: "I came into CS5224 with no idea what IaC or serverless meant. I left having built a twelve-service AWS platform that runs on coffee money. A note on the mental model shift, the part that hurt, and the receipt that proves the design works."
pubDate: "May 10 2026"
heroImage: "/projects/cs5224/architecture.png"
kind: "reflection"
relatedProject: "retailmind"
---

Before this course, my mental model for "deploy an app" was: get a computer, install Postgres on it, install Python on it, run a server. That's it. I knew "the cloud" in the abstract, in the way you know "blockchain" exists, but I had never written infrastructure-as-code, never spun up a Lambda, didn't know what a VPC was for, and would have told you with a straight face that scaling means buying a bigger computer.

CS5224 (Cloud Computing at NUS) is a one-semester module. We had to build a SaaS product that justifies its architecture. My team picked a no-code analytics platform for retail SMEs, and I was the only engineer; the other five did competitor analysis, the user study, the pitch, and QA.

The default move would have been to spin up an EC2, run a FastAPI server on it, drop a Postgres next to it, slap a load balancer on top, and call it a day. We discussed this for about thirty minutes. It was so obviously the easy path that we decided not to take it. The point of the course was to actually use AWS, and the right way to learn serverless is to commit to it on a project that hurts when you cheat.

So we picked the harder path on purpose. Twelve AWS services. Lambda for all the API endpoints. Step Functions for the training pipeline. Fargate for the actual ML training jobs (because Lambda's 15-minute cap and 250 MB package limit make ML training impossible). DynamoDB instead of RDS. Bedrock for the chatbot. CDK to deploy the whole thing in seven stacks. No NAT gateway. No ALB. No SQS.

The thing I want to write about is what it felt like learning all of this from zero in four weeks.

## The mental model shift

The single biggest thing this course taught me was the difference between "always-on" and "event-driven."

In the buy-a-computer model, your server is sitting there twenty-four hours a day, drawing power, charging you whether anyone is using it or not. If a thousand people show up at once, your single computer melts; if nobody shows up, you still pay full price. Your job as the operator is to guess your traffic right.

In the event-driven model, nothing runs unless something triggers it. A user clicks a button, a Lambda spins up in milliseconds, runs for a few hundred ms, dies. A user uploads a CSV, a Step Function fires, runs through five steps over two minutes, terminates. Nobody clicks anything for an hour, you pay zero. A thousand people show up at once, AWS spins up a thousand parallel Lambdas and you pay for exactly that work.

This sounds obvious written down. It was not obvious in my head before the course. I genuinely thought "scale up" meant "buy a bigger computer," and the whole point of the course is that's *one* way to do it, and there's a different way where the cloud provider handles scale and you just pay for what you actually use.

The receipt for our design is that the entire RetailMind platform, twelve services, sixteen Lambdas, training pipeline included, costs roughly five to twelve dollars a month at demo scale. The EC2 lazy version would have been thirty bucks for the box, fifteen for the database, sixteen for the load balancer, and would have been running whether anyone touched it or not. The serverless version is cheaper *and* scales further. That tradeoff is the whole module in one number.

## The part that hurt

The deceptive thing about cloud is that the architecture diagrams look clean. Twelve boxes, arrows between them. Easy.

The reality of building it was: deploy, something fails silently somewhere, hunt through CloudWatch to find the actual error, fix the code, redeploy, fail in a new place. Repeat for four weeks.

The pain was the debugging loop. When you run code on your laptop, you can `print` and see what happened. When you run code in a Lambda invoked by a Step Function triggered by an API Gateway request inside a VPC, you cannot print anything. Errors disappear into CloudWatch Logs, which are split across log groups by service, which are themselves named after auto-generated function ARNs, which means finding the actual error message takes longer than fixing it.

I spent the first two weeks just learning to read the cloud. Where does this error appear? Why is the Step Function failing with `States.TaskFailed` and no detail? (Answer: because the Fargate task crashed and the actual error is in a different log group under ECS, and you have to know to look there.) Why is my Lambda timing out at 3 seconds when I set the timeout to 30? (Answer: I forgot the API Gateway integration timeout, which is also 30, but defaults to 29.) Why is `AccessDenied` in this specific call when the role looks fine? (Answer: the role is fine for the action, but the resource ARN in the policy is wrong.)

There's no clever shortcut for any of this. You just grind through enough of these errors that they start looking the same, and then you start finding the answers faster. By week three I had a mental map of which logs to check first for which kinds of failure. By week four I had stopped breaking things in the same way twice.

## The cost calls

Three specific cost flexes I'm proud of:

**No NAT Gateway.** A NAT Gateway is what lets resources in private subnets talk to the internet. The standard AWS pattern is "put your Fargate tasks in private subnets, route them through a NAT Gateway." A NAT Gateway costs about $33 a month, which would have been more than the entire rest of our bill combined. So I put Fargate in public subnets with public IPs assigned at task launch, and used VPC endpoints for S3 and DynamoDB so traffic to those services never leaves the VPC. Same security guarantee, $33 cheaper.

**No persistent inference endpoint.** SageMaker's "real" inference pattern is a hosted endpoint, which is an always-on container. About $30 a month minimum. Instead, our inference is a Lambda that downloads the pickled model from S3 on each call. Cold start is three to five seconds, which is fine for a demo and would matter only at high RPS, which we don't have.

**Free tier exhaustion as a design strategy.** Of our twelve services, ten run entirely on AWS free tier at our demo scale. The two that don't (Fargate and Bedrock) are pay-per-use, so we only pay when work happens. The architecture isn't shaped around free tier in a hacky way; it just happens that the things you'd reach for in a serverless-first design (Lambda, DynamoDB, S3, API Gateway, CloudFront) are exactly the services with generous free tiers. Picking the right tool buys you the cost story for free.

## What I didn't do, but want to next

Cloud is a huge surface area and four weeks is short. Things I left on the table:

- **Kubernetes.** I keep hearing it's the next thing if you actually want to do this seriously. The workload didn't need it here, but I want to learn it on a side project where it's the right tool, not on a course project where it would have just been complexity for show.
- **SageMaker, properly.** I rejected SageMaker for this project because the point was to build the infrastructure myself. But SageMaker is what you reach for when you actually want to ship ML in production. I should learn it as a tool, not as a thing I'm avoiding to prove a point.
- **Production-grade IAM.** I granted permissions generously while iterating and tightened them only at the end. That's fine for a four-week course project. It is the worst possible discipline for real work.
- **Multi-region.** Singapore region works for a Singapore demo. Anything serving multiple geographies needs more thought, and a real budget.

## The lesson

If I had to pick one thing this module taught me, it's that infrastructure is a design problem, not a logistics problem. The choice between EC2 and Lambda is not a deployment detail; it's a choice about how your system behaves under load, what your costs look like, and what happens when no one is using it. The choice between RDS and DynamoDB is not "which database does the team know"; it's a choice about access patterns and scaling curves.

This is, I think, the actual difference between a CS undergrad who has done a couple of personal cloud projects and an MSBA student who took one cloud course at the end of their masters. I will never have the engineering depth of someone who has been writing code since they were fourteen. But I now know what serverless is for, what it costs, where it breaks, and how to argue for it in a room of people who don't.

Worth the four weeks of CloudWatch hell.

For the project itself, the architecture, the code, and the design calls in detail, see [the RetailMind project page](/projects/retailmind).
