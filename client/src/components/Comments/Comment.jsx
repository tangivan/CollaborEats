const Comment = ({ name, content, createdAt }) => {
  return (
    <article className="w-5/6 my-10 mx-auto flex justify-center">
      <div>
        <img src="https://i.imgur.com/2WZtOD6.png" alt="" />
      </div>
      <div className="bg-stone-300 mx-3 p-5 break-words rounded-lg w-full">
        <h4 className="text-lg font-medium">{name}</h4>
        <p className="h-auto">{content}</p>
        <span className="text-xs">created on: {createdAt}</span>
      </div>
    </article>
  );
};

export default Comment;
