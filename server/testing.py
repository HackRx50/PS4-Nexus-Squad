from apis.nexabot.guardrails import can_perform, check_approval, can_answer_from_docs
from apis.nexabot.guardrails import Document

if __name__=="__main__":
    docs = can_perform("send an email", "agent1")
    print(docs)

    if len(docs) > 0:
        print(check_approval("recipient: aryankarma29@gmail.com and subject: how are you? and body: ask him about his health", docs[0], [
        ], "agent1"))
    
    print()
    print()
    print()
    
    # docs = can_perform("send an email", "agent1")
    # print(docs)

    # if len(docs) > 0:
    #     print(check_approval("recepient: aryankarma29@gmail.com and subject: how are you? and body: ask him about his health", docs[0], [
    #     ], "agent1"))

    card = can_answer_from_docs("what is the uin numbers?", "isurance")
    print(card)