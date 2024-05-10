import { Input } from "./ui/input";

export const MatrixInput = ({ form }) => {
  let cells = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      cells.push(
        <MatrixInputCell key={`cell-${i}-${j}`} form={form} i={i} j={j} />,
      );
    }
  }
  return <div className="grid grid-cols-5 gap-2">{cells}</div>;
};

const MatrixInputCell = ({ form, i, j }) => {
  return (
    <Input
      type="text"
      {...form.field(`matrix.${i}.${j}`, { default_value: 0 })}
    />
  );
};

export const MatrixView = ({ form }) => {
  const { value } = form.useField("matrix");

  let out = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      out.push(<pre key={`view-${i}-${j}`}>{value ? value[i][j] : null}</pre>);
    }
  }

  return <div className="grid grid-cols-5 gap-2 divide-x divide-y">{out}</div>;
};
