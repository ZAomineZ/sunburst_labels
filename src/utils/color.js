export function generate()
{
    return (
        "#" +
        Math.floor((Math.random() * Math.pow(2, 32)) ^ 0xffffff)
            .toString(16)
            .substr(-6)
    );
}