from apis.nexabot.guardrails import can_perform, check_approval, can_answer_from_docs

if __name__=="__main__":
    print(can_answer_from_docs("search about the details of pune ticket", "nova"))